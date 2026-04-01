import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { logActivity } from "../../../middleware/activityLogger";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as categoryService from "./category.service";
import { createCategorySchema, updateCategorySchema } from "./category.validation";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, searchTerm } = req.query;
  const result = await categoryService.getAll({
    page: Number(page),
    limit: Number(limit),
    searchTerm: searchTerm as string,
  });

  res.status(StatusCodes.OK).json({ success: true, ...result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getById(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, data: category });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { body } = createCategorySchema.parse(req);
  const category = await categoryService.create(body);
  await logActivity(`Category created: ${body.name}`);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Category created",
    data: category,
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { body } = updateCategorySchema.parse(req);
  const category = await categoryService.update(req.params.id as string, body);
  await logActivity(`Category updated: ${category.name}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Category updated",
    data: category,
  });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.remove(req.params.id as string);
  await logActivity(`Category deleted: #${String(req.params.id).slice(-6).toUpperCase()}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Category deleted",
  });
});
