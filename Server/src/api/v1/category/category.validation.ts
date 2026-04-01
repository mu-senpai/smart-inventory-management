import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").trim(),
    description: z.string().trim().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").trim().optional(),
    description: z.string().trim().optional(),
  }),
});
