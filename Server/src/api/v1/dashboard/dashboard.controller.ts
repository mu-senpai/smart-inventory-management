import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as dashboardService from "./dashboard.service";

export const getSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await dashboardService.getDashboardSummary();

  res.status(StatusCodes.OK).json({
    success: true,
    data: summary,
  });
});
