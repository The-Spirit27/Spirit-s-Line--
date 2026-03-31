import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://ccsrxvwaxkdbphesyies.supabase.co";
const supabaseKey = "sb_publishable_SqgQjncAuFW7c5buXtpdsw_oWUuez1z";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});