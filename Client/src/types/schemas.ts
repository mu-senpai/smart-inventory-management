import { z } from "zod";

// Mongoose typical ObjectId validation
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const CategorySchema = z.object({
  _id: objectIdSchema,
  name: z.string().min(1, "Category name is required"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export const ProductSchema = z.object({
  _id: objectIdSchema,
  name: z.string().min(1, "Product name is required"),
  category: z.union([objectIdSchema, CategorySchema]), // Depending on populate
  price: z.number().min(0, "Price cannot be negative"),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative"),
  minThreshold: z.number().min(0, "Threshold cannot be negative").default(10),
  description: z.string().optional(),
  status: z.enum(["Active", "OutOfStock"]).default("Active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export type ICategory = z.infer<typeof CategorySchema>;
export type IProduct = z.infer<typeof ProductSchema>;

export const CreateProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Price cannot be negative").optional()),
  stockQuantity: z.preprocess((val) => Number(val), z.number().min(0, "Stock quantity cannot be negative").optional()),
  minThreshold: z.preprocess((val) => Number(val), z.number().min(0, "Threshold cannot be negative").optional()),
  description: z.string().optional()
});

export type CreateProductInput = z.infer<typeof CreateProductFormSchema>;

export const UpdateProductFormSchema = CreateProductFormSchema.partial();
