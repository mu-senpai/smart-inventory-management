import { authenticate } from "../../../middleware/authenticate";
import { tenantMiddleware } from "../../../middleware/tenantMiddleware";
import { Router } from "express";
import * as activityLogController from "./activity-log.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/", activityLogController.getLatest);

export default router;
