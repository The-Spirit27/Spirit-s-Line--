
  // ---------- Supabase Init ----------
  const SUPABASE_URL = "https://ccsrxvwaxkdbphesyies.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_SqgQjncAuFW7c5buXtpdsw_oWUuez1z"; // ta clé ANON

  // Créer le client et le mettre dans window
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;

  // Pour faciliter l'accès depuis admin-logic.js
  const {data : sessionData } = await
  window.supabaseClient.auth.getSession();
