import { authenticate } from "../../../middleware/authenticate";
import { tenantMiddleware } from "../../../middleware/tenantMiddleware";
import { Router } from "express";
import * as categoryController from "./category.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/", categoryController.create);
router.patch("/:id", categoryController.update);
router.delete("/:id", categoryController.remove);

export default router;
