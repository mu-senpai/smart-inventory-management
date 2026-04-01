import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/smart-inventory",
  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  DEMO_EMAIL: process.env.DEMO_EMAIL || "demo@inventory.com",
  DEMO_PASSWORD: process.env.DEMO_PASSWORD || "Demo@1234",
  NODE_ENV: process.env.NODE_ENV || "development",
};
