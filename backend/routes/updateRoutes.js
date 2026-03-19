// routes/updateRoutes.js
import express from "express";
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from "../utils/sendEmail.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.post("/notify-update", async (req, res) => {
  const { title, message } = req.body;

  // Récupérer tous les emails abonnés
  const { data: users, error } = await supabase
    .from("users")
    .select("email")
    .eq("subscribed_updates", true);

  if (error) return res.status(500).json({ error: "Erreur récupération utilisateurs" });

  // Envoyer un email à chaque utilisateur
  for (const user of users) {
    await sendEmail(user.email, title, message);
  }

  res.json({ status: "Emails envoyés" });
});

export default router;