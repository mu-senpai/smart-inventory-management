import { authenticate } from "../../../middleware/authenticate";
import { tenantMiddleware } from "../../../middleware/tenantMiddleware";
import { Router } from "express";
import * as orderController from "./order.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/", orderController.getAll);
router.get("/:id", orderController.getById);
router.post("/", orderController.create);
router.patch("/:id/status", orderController.updateStatus);
router.delete("/:id", orderController.remove);

export default router;
