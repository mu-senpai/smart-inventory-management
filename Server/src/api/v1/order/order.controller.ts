import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { logActivity } from "../../../middleware/activityLogger";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as orderService from "./order.service";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, searchTerm } = req.query;
  const result = await orderService.getAll({
    page: Number(page),
    limit: Number(limit),
    searchTerm: searchTerm as string,
    status: status as any,
  });

  res.status(StatusCodes.OK).json({ success: true, ...result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getById(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, data: order });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { body } = createOrderSchema.parse(req);
  const order = await orderService.create(body.customerName, body.products as any);
  await logActivity(`Order created for ${body.customerName}`);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { body } = updateOrderStatusSchema.parse(req);
  const order = await orderService.updateStatus(req.params.id as string, body.status);
  await logActivity(`Order #${String(req.params.id).slice(-6).toUpperCase()} status updated to ${body.status}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Order status updated",
    data: order,
  });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await orderService.remove(req.params.id as string);
  await logActivity(`Order deleted: #${String(req.params.id).slice(-6).toUpperCase()}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Order deleted",
  });
});
