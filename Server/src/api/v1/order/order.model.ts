import { OrderStatus } from "../../../utils/constants";
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrderProduct {
  product: Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  customerName: string;
  products: IOrderProduct[];
  totalPrice: number;
  status: OrderStatus;
}

const orderProductSchema = new Schema<IOrderProduct>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    products: {
      type: [orderProductSchema],
      validate: {
        validator: (v: IOrderProduct[]) => v.length > 0,
        message: "Order must contain at least one product",
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
  },
  { timestamps: true }
);

import { getTenantDB } from "../../../config/db";

export const getOrderModel = () => {
  const db = getTenantDB();
  return db.models.Order || db.model<IOrder>("Order", orderSchema);
};
