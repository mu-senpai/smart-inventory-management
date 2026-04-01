import { authenticate } from "../../../middleware/authenticate";
import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.use(authenticate);

router.get("/me", userController.getMe);
router.patch("/me", userController.updateMe);

export default router;
