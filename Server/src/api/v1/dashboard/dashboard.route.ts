import { authenticate } from "../../../middleware/authenticate";
import { tenantMiddleware } from "../../../middleware/tenantMiddleware";
import { Router } from "express";
import * as dashboardController from "./dashboard.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/summary", dashboardController.getSummary);

export default router;
