import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as activityLogService from "./activity-log.service";

export const getLatest = asyncHandler(async (_req: Request, res: Response) => {
  const logs = await activityLogService.getLatest();

  res.status(StatusCodes.OK).json({
    success: true,
    data: logs,
  });
});
