import { OrderStatus } from "../../../utils/constants";
import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, "Customer name is required").trim(),
    products: z
      .array(
        z.object({
          product: z.string().min(1, "Product ID is required"),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
        })
      )
      .min(1, "Order must contain at least one product"),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
});
