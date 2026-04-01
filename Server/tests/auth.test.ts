import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Auth Endpoints", () => {
  const testUser = {
    email: "test@auth.com",
    password: "Test@123456",
    role: "Admin",
  };

  describe("POST /api/v1/auth/signup", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should reject duplicate email", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send(testUser);
      expect(res.status).toBe(409);
    });

    it("should reject invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({ email: "bad", password: "123456" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it("should reject wrong password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: "wrong" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/demo-login", () => {
    it("should auto-create demo user and return token", async () => {
      const res = await request(app).post("/api/v1/auth/demo-login");

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(process.env.DEMO_EMAIL);
      expect(res.body.data.token).toBeDefined();
    });
  });
});
