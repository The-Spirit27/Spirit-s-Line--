import dotenv from "dotenv";
dotenv.config();

export const singpayConfig = {
  baseURL: process.env.BASE_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  walletId: process.env.WALLET_ID,
  disbursementId: process.env.DISBURSEMENT_ID,
};