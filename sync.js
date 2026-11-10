/* ============================================================
   Zent — sincronización con Supabase
   ============================================================ */

let supabaseClient = null;

function initSupabase() {
  if (typeof supabase === 'undefined') return null;
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

async function getSession() {
  if (!supabaseClient) return null;
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function signUp(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  return { data, error };
}

async function signOut() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
}

async function loadStateFromSupabase() {
  const session = await getSession();
  if (!session || !session.user) return null;
  const { data, error } = await supabaseClient
    .from('user_states')
    .select('state')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data.state;
}

async function saveStateToSupabase(state) {
  const session = await getSession();
  if (!session || !session.user) return null;
  const { error } = await supabaseClient
    .from('user_states')
    .upsert({ user_id: session.user.id, state, updated_at: new Date().toISOString() });
  return error;
}

initSupabase();
