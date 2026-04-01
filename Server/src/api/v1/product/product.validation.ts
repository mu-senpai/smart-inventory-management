import { ProductStatus } from "../../../utils/constants";
import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required").trim(),
    category: z.string().min(1, "Category is required"),
    price: z.number().min(0, "Price cannot be negative"),
    stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative"),
    minThreshold: z.number().int().min(0, "Threshold cannot be negative").default(10),
    description: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).trim().optional(),
    category: z.string().optional(),
    price: z.number().min(0).optional(),
    stockQuantity: z.number().int().min(0).optional(),
    minThreshold: z.number().int().min(0).optional(),
    description: z.string().optional(),
  }),
});
