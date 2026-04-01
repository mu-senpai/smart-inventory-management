import { Router } from "express";
import activityLogRoutes from "./activity-log/activity-log.route";
import authRoutes from "./auth/auth.route";
import categoryRoutes from "./category/category.route";
import dashboardRoutes from "./dashboard/dashboard.route";
import orderRoutes from "./order/order.route";
import productRoutes from "./product/product.route";
import restockRoutes from "./restock/restock.route";
import userRoutes from "./user/user.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/restock", restockRoutes);
router.use("/activity-logs", activityLogRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
