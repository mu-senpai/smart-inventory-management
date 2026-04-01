import mongoose from "mongoose";
import { env } from "./env";
import { tenantContext } from "../utils/tenantContext";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export const getTenantDB = (): mongoose.Connection => {
  const tenantId = tenantContext.getStore();
  if (!tenantId) {
    throw new Error("Tenant context missing. Ensure tenantMiddleware is applied.");
  }
  
  // Return the tenant-specific connection leveraging Mongoose's connection cache
  return mongoose.connection.useDb(`tenant_${tenantId}`, { useCache: true });
};
