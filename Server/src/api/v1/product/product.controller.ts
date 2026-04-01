import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { logActivity } from "../../../middleware/activityLogger";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as productService from "./product.service";
import { createProductSchema, updateProductSchema } from "./product.validation";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, searchTerm } = req.query;
  const result = await productService.getAll({
    page: Number(page),
    limit: Number(limit),
    searchTerm: searchTerm as string,
  });

  res.status(StatusCodes.OK).json({ success: true, ...result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getById(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, data: product });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { body } = createProductSchema.parse(req);
  const product = await productService.create(body as any);
  await logActivity(`Product created: ${body.name}`);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Product created",
    data: product,
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { body } = updateProductSchema.parse(req);
  const product = await productService.update(req.params.id as string, body as any);
  await logActivity(`Product updated: ${product.name}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product updated",
    data: product,
  });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await productService.remove(req.params.id as string);
  await logActivity(`Product deleted: #${String(req.params.id).slice(-6).toUpperCase()}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product deleted",
  });
});

export const getLowStock = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getLowStock();
  res.status(StatusCodes.OK).json({ success: true, data: products });
});
