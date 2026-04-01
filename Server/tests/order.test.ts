import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app";

let token: string;
let categoryId: string;
let activeProductId: string;
let inactiveProductId: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);

  // Create user
  const signupRes = await request(app)
    .post("/api/v1/auth/signup")
    .send({ email: "order@test.com", password: "Test@123456", role: "Admin" });
  token = signupRes.body.data.token;

  // Create category
  const catRes = await request(app)
    .post("/api/v1/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Gadgets" });
  categoryId = catRes.body.data._id;

  // Create active product with stock 5
  const activeRes = await request(app)
    .post("/api/v1/products")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Widget",
      category: categoryId,
      price: 10,
      stockQuantity: 5,
      minThreshold: 3,
    });
  activeProductId = activeRes.body.data._id;

  // Create inactive product
  const inactiveRes = await request(app)
    .post("/api/v1/products")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Discontinued Item",
      category: categoryId,
      price: 50,
      stockQuantity: 0,
      minThreshold: 5,
      status: "OutOfStock",
    });
  inactiveProductId = inactiveRes.body.data._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Order Endpoints", () => {
  describe("POST /api/v1/orders — Stock Deduction", () => {
    it("should place an order and deduct stock", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customerName: "John Doe",
          products: [{ product: activeProductId, quantity: 2 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.totalPrice).toBe(20);

      // Verify stock was deducted
      const productRes = await request(app)
        .get(`/api/v1/products/${activeProductId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(productRes.body.data.stockQuantity).toBe(3);
    });

    it("should prevent order when quantity exceeds stock", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customerName: "Jane Doe",
          products: [{ product: activeProductId, quantity: 100 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("available in stock");
    });
  });

  describe("POST /api/v1/orders — Conflict Handling", () => {
    it("should reject duplicate products in one order", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customerName: "Bob",
          products: [
            { product: activeProductId, quantity: 1 },
            { product: activeProductId, quantity: 1 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Duplicate");
    });

    it("should block orders for inactive products", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customerName: "Alice",
          products: [{ product: inactiveProductId, quantity: 1 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("inactive");
    });
  });

  describe("PATCH /api/v1/orders/:id/status", () => {
    it("should update order status", async () => {
      // First create an order
      const createRes = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customerName: "Status Test",
          products: [{ product: activeProductId, quantity: 1 }],
        });

      const orderId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "Confirmed" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("Confirmed");
    });
  });
});
