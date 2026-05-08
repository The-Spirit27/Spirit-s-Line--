import { randomUUID } from "crypto";
import { supabase } from "../config/supabase.js";
import { createPayment } from "../services/singpay.service.js";

export const payer = async (req, res) => {
  try {
    const { id_outil, phone } = req.body;

    if (!id_outil || !phone) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    // 🔥 1. récupérer l'outil depuis Supabase
    const { data: outil, error } = await supabase
      .from("outils")
      .select("*")
      .eq("id_outil", id_outil)
      .single();

    if (error || !outil) {
      return res.status(404).json({ message: "Outil introuvable" });
    }

    // 🔥 2. récupérer le prix réel
    const amount = outil.prix;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Prix invalide" });
    }

    // 🔥 3. générer référence unique
    const reference = `PAY-${Date.now()}-${randomUUID().slice(0, 6)}`;

    // 🔥 4. envoyer à SingPay
    const result = await createPayment({
      amount,
      phone,
      reference
    });

    res.json(result);

  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ message: "Paiement échoué" });
  }
};