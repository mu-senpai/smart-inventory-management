import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as userService from "./user.service";
import { updateUserSchema } from "./user.validation";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.user!.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: user,
  });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { body } = updateUserSchema.parse(req);
  const user = await userService.updateUser(req.user!.userId, body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});
