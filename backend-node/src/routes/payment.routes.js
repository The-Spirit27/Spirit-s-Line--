import express from "express";
import { payer } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/payer", payer);

export default router;