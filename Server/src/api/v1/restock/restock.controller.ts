import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as restockService from "./restock.service";

export const getQueue = asyncHandler(async (_req: Request, res: Response) => {
  const queue = await restockService.getRestockQueue();

  res.status(StatusCodes.OK).json({
    success: true,
    data: queue,
  });
});
