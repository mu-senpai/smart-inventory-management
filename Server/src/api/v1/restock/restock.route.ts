import { authenticate } from "../../../middleware/authenticate";
import { tenantMiddleware } from "../../../middleware/tenantMiddleware";
import { Router } from "express";
import * as restockController from "./restock.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/queue", restockController.getQueue);

export default router;
