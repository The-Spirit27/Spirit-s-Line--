import express from "express";
import cors from "cors";

const app = express(); // 🔥 TOUJOURS EN PREMIER

// middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-client-id", "x-client-secret", "x-wallet"]
}));

app.use(express.json());

// routes
import payerRoute from "./routes/payment.routes.js";
app.use("/api", payerRoute);

export default app;