import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app";

let token: string;
let categoryId: string;
let productId: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);

  // Create a test user and get token
  const signupRes = await request(app)
    .post("/api/v1/auth/signup")
    .send({ email: "product@test.com", password: "Test@123456", role: "Admin" });
  token = signupRes.body.data.token;

  // Create a test category
  const catRes = await request(app)
    .post("/api/v1/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Electronics" });
  categoryId = catRes.body.data._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Product Endpoints", () => {
  describe("POST /api/v1/products", () => {
    it("should create a product", async () => {
      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Laptop",
          category: categoryId,
          price: 999.99,
          stockQuantity: 50,
          minThreshold: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Laptop");
      expect(res.body.data.stockQuantity).toBe(50);
      productId = res.body.data._id;
    });
  });

  describe("GET /api/v1/products/low-stock", () => {
    it("should return products below threshold", async () => {
      // Create a low-stock product
      await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Mouse",
          category: categoryId,
          price: 25,
          stockQuantity: 3,
          minThreshold: 10,
        });

      const res = await request(app)
        .get("/api/v1/products/low-stock")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].stockQuantity).toBeLessThan(
        res.body.data[0].minThreshold
      );
    });
  });

  describe("PATCH /api/v1/products/:id", () => {
    it("should update product stock and auto-update status", async () => {
      const res = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ stockQuantity: 0 });

      expect(res.status).toBe(200);
      expect(res.body.data.stockQuantity).toBe(0);
      expect(res.body.data.status).toBe("OutOfStock");
    });

    it("should re-activate when stock is restored", async () => {
      const res = await request(app)
        .patch(`/api/v1/products/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ stockQuantity: 20 });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("Active");
    });
  });
});
