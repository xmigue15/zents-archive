/* ============================================================
   Zent — sincronización con Supabase
   La app es local primero: abre al instante con lo guardado en
   el dispositivo. Internet solo se usa para subir los cambios y,
   en un dispositivo nuevo, para traer la copia de la nube.
   Si no hay red, los cambios quedan en cola y se suben solos
   cuando vuelve la conexión.
   ============================================================ */

(() => {
  'use strict';

  const STORAGE_KEY = 'zent.state.v1';
  const PENDING_KEY = 'zent.sync.pending';
  const REQUEST_TIMEOUT = 12000;

  let client = null;
  let readyToSave = false;
  let flushing = false;
  let flushAgain = false;
  let retryTimer = null;
  let retryStep = 0;
  let lastState = null;
  let pending = readPending();
  /* En un dispositivo nuevo no se sube nada hasta comprobar qué hay en
     la nube: así una conexión mala nunca sobrescribe la copia buena. */
  let puedeSubir = true;
  let nubeRevisada = false;

  function readPending() {
    try { return localStorage.getItem(PENDING_KEY) === '1'; } catch (error) { return false; }
  }

  function setPending(value) {
    if (pending === value) return;
    pending = value;
    try {
      if (value) localStorage.setItem(PENDING_KEY, '1');
      else localStorage.removeItem(PENDING_KEY);
    } catch (error) { /* sin almacenamiento */ }
    emitStatus();
  }

  function readLocalState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function currentPayload() {
    return lastState || readLocalState();
  }

  function emitStatus() {
    try {
      window.dispatchEvent(new CustomEvent('zent-sync', { detail: status() }));
    } catch (error) { /* navegador muy antiguo */ }
  }

  function status() {
    return {
      online: navigator.onLine !== false,
      pending,
      ready: Boolean(client),
      blocked: !puedeSubir
    };
  }

  function withTimeout(promise, ms) {
    let timer = null;
    return Promise.race([
      Promise.resolve(promise),
      new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), ms || REQUEST_TIMEOUT);
      })
    ]).finally(() => { if (timer) clearTimeout(timer); });
  }

  function init() {
    if (client) return client;
    if (typeof window === 'undefined') return null;
    if (typeof window.supabase === 'undefined' || !window.supabase) return null;
    if (typeof SUPABASE_URL !== 'string' || typeof SUPABASE_ANON_KEY !== 'string') {
      console.error('Zent: falta supabase-config.js.');
      return null;
    }
    try {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      window.supabaseClient = client;
      emitStatus();
    } catch (error) {
      console.error('Zent: no se pudo crear el cliente de Supabase.', error);
      client = null;
    }
    return client;
  }

  /* Espera a que la librería local de Supabase esté disponible.
     El script se carga con `defer`, así que puede llegar después
     que este archivo; nunca se bloquea la app por eso. */
  async function ensureClient() {
    if (client) return client;
    if (typeof window.supabase !== 'undefined' && window.supabase) return init();
    for (let i = 0; i < 20; i += 1) {
      if (typeof window.supabase !== 'undefined' && window.supabase) return init();
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return init();
  }

  async function getSession() {
    const sb = await ensureClient();
    if (!sb) return null;
    try {
      const { data, error } = await withTimeout(sb.auth.getSession(), REQUEST_TIMEOUT);
      if (error) return null;
      return data ? data.session : null;
    } catch (error) {
      return null;
    }
  }

  /* Comprueba la sesión y distingue "no hay sesión" de "no hubo
     respuesta" (sin conexión), para no sacar al usuario de la app
     cuando está sin internet. */
  async function checkSession() {
    if (navigator.onLine === false) return { session: null, timedOut: true };
    const sb = await ensureClient();
    if (!sb) return { session: null, timedOut: true };
    try {
      const { data, error } = await withTimeout(sb.auth.getSession(), REQUEST_TIMEOUT);
      if (error) return { session: null, timedOut: true };
      return { session: data ? data.session : null, timedOut: false };
    } catch (error) {
      return { session: null, timedOut: true };
    }
  }

  async function signIn(email, password) {
    const sb = await ensureClient();
    if (!sb) return { data: null, error: new Error('Supabase no está disponible.') };
    return sb.auth.signInWithPassword({ email, password });
  }

  async function signUp(email, password) {
    const sb = await ensureClient();
    if (!sb) return { data: null, error: new Error('Supabase no está disponible.') };
    return sb.auth.signUp({ email, password });
  }

  async function signOut() {
    try {
      const sb = await ensureClient();
      if (sb) await sb.auth.signOut();
    } catch (error) {
      console.warn('Zent: error al cerrar sesión.', error);
    }
    // La próxima sesión en este dispositivo empieza de cero y vuelve a
    // comprobar la nube antes de subir nada.
    setPending(false);
    puedeSubir = true;
    nubeRevisada = false;
    lastState = null;
    resetRetry();
  }

  /* Solo se usa en un dispositivo nuevo (sin datos locales) o
     cuando el usuario pide traer la copia de la nube a mano.
     Devuelve el estado, o null si no hay copia o no se pudo leer;
     `cloudChecked()` dice si la respuesta de la nube fue segura. */
  async function loadStateFromSupabase() {
    nubeRevisada = false;
    if (navigator.onLine === false) return null;
    const sb = await ensureClient();
    if (!sb) return null;
    try {
      const session = await getSession();
      if (!session || !session.user) return null;
      nubeRevisada = true;

      const { data, error } = await withTimeout(
        sb.from('user_states').select('state').eq('user_id', session.user.id).maybeSingle(),
        REQUEST_TIMEOUT
      );

      if (error) {
        nubeRevisada = false;
        console.warn('Zent: no se pudo leer el estado en Supabase.', error.message, error.code);
        return null;
      }
      if (!data || !data.state) return null;

      return data.state;
    } catch (error) {
      nubeRevisada = false;
      console.warn('Zent: fallo al cargar desde Supabase.', error);
      return null;
    }
  }

  function scheduleRetry() {
    if (retryTimer || navigator.onLine === false) return;
    const delays = [8000, 20000, 60000, 180000];
    if (retryStep >= delays.length) return;
    const wait = delays[retryStep];
    retryStep += 1;
    retryTimer = setTimeout(() => {
      retryTimer = null;
      flushPending();
    }, wait);
  }

  function resetRetry() {
    retryStep = 0;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  /* Si el dispositivo es nuevo y no se pudo comprobar la nube, se
     reintenta más tarde para poder subir con seguridad. */
  let pullTimer = null;

  function schedulePullRetry() {
    if (pullTimer || navigator.onLine === false) return;
    pullTimer = setTimeout(() => {
      pullTimer = null;
      if (!puedeSubir) {
        try { window.dispatchEvent(new CustomEvent('zent-needs-pull')); } catch (error) { /* nada */ }
      }
    }, 15000);
  }

  async function upsertState(sb, payload) {
    const session = await getSession();
    if (!session || !session.user) return new Error('sin-sesion');

    const { error } = await withTimeout(
      sb.from('user_states').upsert(
        { user_id: session.user.id, state: payload, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      ),
      REQUEST_TIMEOUT
    );
    return error || null;
  }

  /* Sube el último estado conocido. Si falla o no hay red, queda
     marcado como pendiente para reintentarlo después. */
  async function flushPending(force) {
    if (!pending && !force) return null;
    if (!puedeSubir) {
      if (pending) schedulePullRetry();
      return null;
    }
    if (flushing) {
      flushAgain = true;
      return null;
    }
    if (navigator.onLine === false) return null;

    const payload = currentPayload();
    if (!payload) return null;

    const sb = await ensureClient();
    if (!sb) {
      // La libreria de Supabase no esta disponible: se reintenta despues.
      scheduleRetry();
      return null;
    }

    flushing = true;
    try {
      const error = await upsertState(sb, payload);
      if (error) {
        if (error.message !== 'sin-sesion') scheduleRetry();
        return error;
      }
      resetRetry();
      setPending(false);
      return null;
    } catch (error) {
      scheduleRetry();
      return error;
    } finally {
      flushing = false;
      if (flushAgain) {
        flushAgain = false;
        setTimeout(flushPending, 600);
      }
    }
  }

  function saveState(state) {
    if (state) lastState = state;
    if (!readyToSave) {
      setPending(true);
      return Promise.resolve(null);
    }
    setPending(true);
    return flushPending();
  }

  function markLoaded() {
    readyToSave = true;
    if (navigator.onLine !== false) flushPending();
  }

  function holdUploads() {
    puedeSubir = false;
    emitStatus();
  }

  function releaseUploads() {
    puedeSubir = true;
    if (pullTimer) {
      clearTimeout(pullTimer);
      pullTimer = null;
    }
    emitStatus();
  }

  function cloudChecked() {
    return nubeRevisada;
  }

  window.sync = {
    init,
    ensureClient,
    getSession,
    checkSession,
    signIn,
    signUp,
    signOut,
    loadStateFromSupabase,
    saveState,
    flushPending,
    markLoaded,
    holdUploads,
    releaseUploads,
    cloudChecked,
    status,
    isReady: () => Boolean(client)
  };

  window.addEventListener('online', () => {
    resetRetry();
    emitStatus();
    if (!puedeSubir) {
      // Dispositivo nuevo sin comprobar: primero se mira la nube.
      window.dispatchEvent(new CustomEvent('zent-needs-pull'));
    }
    flushPending();
  });
  window.addEventListener('offline', emitStatus);

  /* En login.html la libreria ya esta cargada, asi que el cliente
     queda listo de inmediato. En index.html la libreria se carga en
     paralelo; este vigilante la engancha en cuanto aparece, sin
     frenar nunca el arranque de la app. */
  function watchLibrary() {
    if (init()) return;
    let intentos = 0;
    const timer = setInterval(() => {
      intentos += 1;
      if (init() || intentos > 60) clearInterval(timer);
    }, 200);
  }

  watchLibrary();
})();
