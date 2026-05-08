import dotenv from "dotenv";
dotenv.config(); // 🔥 DOIT ÊTRE EN PREMIER

import app from "./app.js";

console.log("ENV TEST =>", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});