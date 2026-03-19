// serveur.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON du front

// --- Route test ---
app.get("/api/test", (req, res) => res.json({ status: "ok" }));
app.get("/", (req,res) => {
    res.send("Backend Spirit's Line OK! ");
});

// --- Route paiement MyPvit ---
app.post("/api/payer", async (req, res) => {
  const { id_outil, montant, phone } = req.body;

  if (!id_outil || !montant || !phone) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    // Référence unique (alphanumérique, max 20)
    const reference = `O${Date.now()}`.slice(0, 20);

    // Payload MyPvit
 const payload = {
  merchant_operation_account_code: process.env.MYPVIT_MERCHANT_SLUG,
  reference: `REF${Date.now()}`,
  transaction_type: "PAYMENT",
  amount: montant,
  currency: "XAF",
  operator: "MC",
  country: "GA",
  service: "WEB",
  customer_account_number: phone,
  success_redirection_url_code: process.env.MYPVIT_SUCCESS_CODE,
  failed_redirection_url_code: process.env.MYPVIT_FAILED_CODE,
  callback_url_code: process.env.MYPVIT_CALLBACK_CODE,
  owner_charge: "CUSTOMER",
  agent: "web",
  ip_address: "127.0.0.1"
};

    // Requête vers MyPvit
    const response = await axios.post(
      "https://api.mypvit.pro/DJIMJZJFAGWACBDO/link",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Secret": process.env.MYPVIT_SECRET_KEY
        }
      }
    );

    // Renvoi de l’URL de paiement au front
    res.json({ paymentUrl: response.data.payment_link_url });

  } catch (err) {
    console.error("Erreur paiement:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Impossible de générer le paiement", 
      details: err.response?.data 
    });
  }
});

// --- Lancer le serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend en écoute sur le port ${PORT}`));

