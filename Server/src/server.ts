import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

// ─── Cached DB connection (persists across Vercel warm invocations) ──
let isConnected = false;

const ensureDbConnected = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// ─── Local development: connect then listen ──────────────────────
if (process.env.VERCEL !== "1") {
  ensureDbConnected().then(() => {
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📘 API base: http://localhost:${env.PORT}/api/v1`);
    });
  }).catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

// ─── Vercel serverless: export app with DB connection wrapper ────
export default async (req: any, res: any) => {
  await ensureDbConnected();
  return app(req, res);
};
