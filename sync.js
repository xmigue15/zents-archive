/* ============================================================
   Zent — sincronización con Supabase
   Expone el objeto global `sync` y el cliente `supabaseClient`.
   ============================================================ */

(() => {
  'use strict';

  let client = null;
  let initialLoadDone = false;

  function init() {
    if (client) return client;
    if (typeof supabase === 'undefined') {
      console.error('Zent: no se pudo cargar supabase-js desde el CDN.');
      return null;
    }
    if (typeof SUPABASE_URL !== 'string' || typeof SUPABASE_ANON_KEY !== 'string') {
      console.error('Zent: falta supabase-config.js.');
      return null;
    }
    try {
      client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      window.supabaseClient = client;
    } catch (error) {
      console.error('Zent: no se pudo crear el cliente de Supabase.', error);
      client = null;
    }
    return client;
  }

  async function getSession() {
    if (!client) return null;
    try {
      const { data, error } = await client.auth.getSession();
      if (error) return null;
      return data.session;
    } catch (error) {
      return null;
    }
  }

  async function signIn(email, password) {
    if (!client) return { data: null, error: new Error('Supabase no está disponible.') };
    return client.auth.signInWithPassword({ email, password });
  }

  async function signUp(email, password) {
    if (!client) return { data: null, error: new Error('Supabase no está disponible.') };
    return client.auth.signUp({ email, password });
  }

  async function signOut() {
    if (!client) return;
    try {
      await client.auth.signOut();
    } catch (error) {
      console.warn('Zent: error al cerrar sesión.', error);
    }
  }

  async function loadStateFromSupabase() {
    if (!client) {
      initialLoadDone = true;
      return null;
    }
    try {
      const session = await getSession();
      if (!session || !session.user) return null;

      const { data, error } = await client
        .from('user_states')
        .select('state')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.warn('Zent: no se pudo leer el estado en Supabase.', error.message, error.code);
        return null;
      }
      if (!data || !data.state) return null;

      return data.state;
    } catch (error) {
      console.warn('Zent: fallo al cargar desde Supabase.', error);
      return null;
    } finally {
      initialLoadDone = true;
    }
  }

  async function saveState(state) {
    if (!client || !initialLoadDone) return null;
    try {
      const session = await getSession();
      if (!session || !session.user) return null;

      const { error } = await client
        .from('user_states')
        .upsert(
          { user_id: session.user.id, state, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.warn('Zent: no se pudo guardar en Supabase.', error.message, error.code);
        return error;
      }
      return null;
    } catch (error) {
      console.warn('Zent: fallo al guardar en Supabase.', error);
      return error;
    }
  }

  function markLoaded() {
    initialLoadDone = true;
  }

  window.sync = {
    init,
    getSession,
    signIn,
    signUp,
    signOut,
    loadStateFromSupabase,
    saveState,
    markLoaded,
    isReady: () => Boolean(client)
  };

  init();
})();
