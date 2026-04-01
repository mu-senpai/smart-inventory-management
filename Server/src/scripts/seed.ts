import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { UserRole, ProductStatus, OrderStatus } from "../utils/constants";
import { User } from "../api/v1/user/user.model";
import { getCategoryModel } from "../api/v1/category/category.model";
import { getProductModel } from "../api/v1/product/product.model";
import { getOrderModel } from "../api/v1/order/order.model";
import { getActivityLogModel } from "../api/v1/activity-log/activity-log.model";
import { tenantContext } from "../utils/tenantContext";

// Load environment variables
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("Missing MONGODB_URI in environment. Aborting seeder.");
  process.exit(1);
}

async function seed() {
  try {
    console.log("🔌 Connecting to Database...");
    await mongoose.connect(MONGO_URI!);
    console.log("✅ Connected. Purging old core records...");

    await User.deleteMany({});
    console.log("🧹 Clean slate for Users.\n");

    // ─── 1. Users ─────────────────────────────────────────────────────
    const adminUser = await User.create({
      email: "admin@gmail.com",
      password: "123456",
      role: UserRole.ADMIN,
    });

    const demoUser = await User.create({
      email: process.env.DEMO_EMAIL || "demo@inventory.com",
      password: process.env.DEMO_PASSWORD || "Demo@1234",
      role: UserRole.ADMIN,
    });

    const managerUser = await User.create({
      email: "manager@smartinventory.com",
      password: "123456",
      role: UserRole.MANAGER,
    });

    console.log("✅ 3 Users seeded");
    console.log("\n🌱 Seeding tenant-specific data...");

    const seedTenantData = async (user: any, label: string) => {
      return new Promise<void>((resolve, reject) => {
        tenantContext.run(user.id, async () => {
          try {
            const Category = getCategoryModel();
            const Product = getProductModel();
            const Order = getOrderModel();
            const ActivityLog = getActivityLogModel();

            console.log(`🧹 Purging old tenant records for ${label}: ${user.id}`);
            await Promise.all([
              Category.deleteMany({}),
              Product.deleteMany({}),
              Order.deleteMany({}),
              ActivityLog.deleteMany({}),
            ]);

            // ─── 2. Categories ────────────────────────────────────────────────
            const [electronics, apparel, homeGoods, grocery] = await Promise.all([
              Category.create({ name: "Electronics", description: "Gadgets, tech items, and accessories" }),
              Category.create({ name: "Apparel", description: "Clothing, garments, and fashion items" }),
              Category.create({ name: "Home Goods", description: "Everyday home and kitchen essentials" }),
              Category.create({ name: "Grocery", description: "Food, beverages, and daily consumables" }),
            ]);

            console.log(`✅ [${label}] 4 Categories seeded`);

            // ─── 3. Products ──────────────────────────────────────────────────
            const productsData = [
              { name: "iPhone 13 Pro", category: electronics._id, price: 999.99, stockQuantity: 3, minThreshold: 10 },
              { name: "MacBook Air M2", category: electronics._id, price: 1199.99, stockQuantity: 50, minThreshold: 5 },
              { name: "AirPods Pro", category: electronics._id, price: 249.99, stockQuantity: 0, minThreshold: 15 },
              { name: "Samsung Galaxy S24", category: electronics._id, price: 849.99, stockQuantity: 25, minThreshold: 8 },
              { name: "Sony WH-1000XM5", category: electronics._id, price: 349.99, stockQuantity: 7, minThreshold: 12 },
              { name: "Cotton T-Shirt", category: apparel._id, price: 15.99, stockQuantity: 4, minThreshold: 50 },
              { name: "Denim Jeans", category: apparel._id, price: 45.99, stockQuantity: 150, minThreshold: 20 },
              { name: "Running Shoes", category: apparel._id, price: 89.99, stockQuantity: 18, minThreshold: 10 },
              { name: "Stainless Steel Water Bottle", category: homeGoods._id, price: 24.99, stockQuantity: 60, minThreshold: 15 },
              { name: "Ceramic Coffee Mug Set", category: homeGoods._id, price: 19.99, stockQuantity: 2, minThreshold: 10 },
            ];

            const products = await Product.insertMany(productsData);
            console.log(`✅ [${label}] ${products.length} Products seeded`);

            const [pIphone, pMacbook, , pSamsung, , pTshirt, pJeans, pShoes] = products;

            // ─── 4. Orders ────────────────────────────────────────────────────
            const ordersData = [
              {
                customerName: "Alice Smith",
                products: [
                  { product: pIphone._id, quantity: 1 },
                  { product: pSamsung._id, quantity: 2 },
                ],
                totalPrice: pIphone.price + pSamsung.price * 2,
                status: OrderStatus.DELIVERED,
              },
              {
                customerName: "Tesla Corp",
                products: [{ product: pMacbook._id, quantity: 10 }],
                totalPrice: pMacbook.price * 10,
                status: OrderStatus.PENDING,
              },
              {
                customerName: "Bob Johnson",
                products: [
                  { product: pTshirt._id, quantity: 5 },
                  { product: pJeans._id, quantity: 3 },
                ],
                totalPrice: pTshirt.price * 5 + pJeans.price * 3,
                status: OrderStatus.SHIPPED,
              },
              {
                customerName: "Jane Doe",
                products: [{ product: pShoes._id, quantity: 2 }],
                totalPrice: pShoes.price * 2,
                status: OrderStatus.CONFIRMED,
              },
            ];

            const seededOrders = await Order.insertMany(ordersData);
            console.log(`✅ [${label}] ${seededOrders.length} Orders seeded`);

            // ─── 5. Activity Logs ─────────────────────────────────────────────
            const logEntries = [
              `System initialized by ${user.email}`,
              `Stock updated for "iPhone 13 Pro" — reduced to 3 units`,
              `Product "AirPods Pro" marked as Out of Stock`,
              `Category "Grocery" created`,
            ];

            await ActivityLog.insertMany(logEntries.map((action) => ({ action })));
            console.log(`✅ [${label}] ${logEntries.length} Activity Logs seeded`);

            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    };

    // Seed data for both Admin and Demo users
    await seedTenantData(adminUser, "ADMIN");
    await seedTenantData(demoUser, "DEMO");

    console.log("\n🚀 Database seeded successfully!");
    console.log("   Demo login: " + (process.env.DEMO_EMAIL || "demo@inventory.com") + " / " + (process.env.DEMO_PASSWORD || "Demo@1234"));
    console.log("   Admin login: admin@gmail.com / 123456");
    console.log("   Manager login: manager@smartinventory.com / 123456\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
