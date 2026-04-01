import v1Routes from "./api/v1";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import cors from "cors";
import express from "express";

const app = express();

// ─── Global Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Health Check ────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────
app.use("/api/v1", v1Routes);

// ─── Global Error Handler (must be last) ─────────────────────────
app.use(errorHandler);

export default app;
