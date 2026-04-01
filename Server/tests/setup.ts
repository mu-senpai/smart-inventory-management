import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

export default async function globalSetup() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = "test_jwt_secret";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.DEMO_EMAIL = "demo@test.com";
  process.env.DEMO_PASSWORD = "Demo@1234";

  // Store the instance for teardown
  (globalThis as any).__MONGOSERVER__ = mongoServer;
}
