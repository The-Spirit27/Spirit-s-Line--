// const axios = require("axios");

// // const BASE_URL = "https://singpay.ga/74/paiement"; // à adapter selon l’URL réelle
// // const CLIENT_ID = "9d8288be-6e59-4739-bc86-b004cd8d13bc";       // fourni par SingPay
// // const CLIENT_SECRET = "0d56485bd4918acb47ee8148a880a2b433efd4b16320ca2a4aac9d64095e9406"; // fourni par SingPay
// // const WALLET_ID = "69c1dab636b9b609a05c3fa0";       // récupéré dans ton Workspace SingPay

// // async function lancerPaiement() {
// //   try {
// //     const payload = {
// //       amount: 5000,                // Montant en XAF
// //       reference: "SPL-TEST-001",   // Référence unique du marchand
// //       client_msisdn: "241XXXXXXXX", // Numéro Airtel Money du client
// //       portefeuille: WALLET_ID,     // ID du portefeuille
// //       disbursement: "DISB_ID",     // obligatoire en production
// //       isTransfer: false
// //     };

// //     const response = await axios.post(BASE_URL, payload, {
// //       headers: {
// //         "Content-Type": "application/json",
// //         "x-client-id": CLIENT_ID,
// //         "x-client-secret": CLIENT_SECRET,
// //         "x-wallet": WALLET_ID
// //       }
// //     });

// //     console.log("Réponse SingPay :", response.data);
// //   } catch (error) {
// //     console.error("Erreur :", error.response?.data || error.message);
// //   }
// // }

// // lancerPaiement();


const axios = require("axios");

const BASE_URL = "https://gateway.singpay.ga/v1/62/paiement"; // endpoint Moov Money
const CLIENT_ID = "9d8288be-6e59-4739-bc86-b004cd8d13bc";       // fourni par SingPay
const CLIENT_SECRET = "T0d56485bd4918acb47ee8148a880a2b433efd4b16320ca2a4aac9d64095e9406"; // fourni par SingPay
const WALLET_ID = "69c1dab636b9b609a05c3fa0";       // récupéré dans ton Workspace SingPay

async function lancerPaiementMoov() {
  try {
    const payload = {
      amount: 5000,                // Montant en XAF
      reference: "SPL-MOOV-001",   // Référence unique du marchand
      client_msisdn: "241XXXXXXXX", // Numéro Moov Money du client
      portefeuille: WALLET_ID,     // ID du portefeuille
      disbursement: "DISB_ID",     // obligatoire en production
      isTransfer: false
    };

    const response = await axios.post(BASE_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
        "x-wallet": WALLET_ID
      }
    });

    console.log("Réponse SingPay (Moov) :", response.data);
  } catch (error) {
    console.error("Erreur Moov :", error.response?.data || error.message);
  }
}

lancerPaiementMoov();