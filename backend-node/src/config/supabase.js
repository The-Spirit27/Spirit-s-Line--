import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL) {
  throw new Error("❌ SUPABASE_URL manquant dans .env");
}

if (!process.env.SUPABASE_KEY) {
  throw new Error("❌ SUPABASE_KEY manquant dans .env");
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);