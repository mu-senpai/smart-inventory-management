import { authenticate } from "../../../middleware/authenticate";
import { tenantMiddleware } from "../../../middleware/tenantMiddleware";
import { Router } from "express";
import * as productController from "./product.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/", productController.getAll);
router.get("/low-stock", productController.getLowStock);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.patch("/:id", productController.update);
router.delete("/:id", productController.remove);

export default router;
