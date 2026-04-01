import { logActivity } from "../../../middleware/activityLogger";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as authService from "./auth.service";
import { loginSchema, signupSchema } from "./auth.validation";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { body } = signupSchema.parse(req);
  const result = await authService.signup(body.email, body.password, body.role);
  await logActivity(`New user registered: ${body.email}`);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { body } = loginSchema.parse(req);
  const result = await authService.login(body.email, body.password);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const demoLogin = asyncHandler(async (_req: Request, res: Response) => {
  const result = await authService.demoLogin();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Demo login successful",
    data: result,
  });
});
