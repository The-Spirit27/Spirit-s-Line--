import axios from "axios";
import { singpayConfig } from "../config/singpay.js";

export const createPayment = async ({ amount, phone, reference, operator }) => {
  const endpoint = operator === "Airtel" ? "/74/paiement" : "/62/paiement";

  const response = await axios.post(
    `${singpayConfig.baseURL}${endpoint}`,
    {
      amount,
      reference,
      client_msisdn: phone,
      portefeuille: singpayConfig.walletId,
      disbursement: singpayConfig.disbursementId,
      isTransfer: false,
    },
    {
      headers: {
        "x-client-id": singpayConfig.clientId,
        "x-client-secret": singpayConfig.clientSecret,
        "x-wallet": singpayConfig.walletId,
      },
    }
  );

  return response.data;
};