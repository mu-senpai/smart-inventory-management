import { Router } from "express";
import * as authController from "./auth.controller";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/demo-login", authController.demoLogin);

export default router;
