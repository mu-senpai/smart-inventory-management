import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalTeardown() {
  const mongoServer: MongoMemoryServer = (globalThis as any).__MONGOSERVER__;
  if (mongoServer) {
    await mongoServer.stop();
  }
}
