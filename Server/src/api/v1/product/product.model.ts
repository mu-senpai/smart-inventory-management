import { ProductStatus } from "../../../utils/constants";
import mongoose, { Document, Schema, Types, Query } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: Types.ObjectId;
  price: number;
  stockQuantity: number;
  minThreshold: number;
  description?: string;
  status: ProductStatus;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    minThreshold: {
      type: Number,
      required: [true, "Minimum threshold is required"],
      min: [0, "Threshold cannot be negative"],
      default: 10,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
  },
  { timestamps: true }
);

// Auto-update status based on stockQuantity before saving
productSchema.pre<IProduct>("save", function (next) {
  if (this.stockQuantity <= 0) {
    this.status = ProductStatus.OUT_OF_STOCK;
  } else {
    this.status = ProductStatus.ACTIVE;
  }
  next();
});

// Auto-update status based on stockQuantity before findOneAndUpdate
productSchema.pre<Query<any, IProduct>>("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  // If stockQuantity is being directly set, we can update status in the same operation
  if (update && typeof update.stockQuantity === "number") {
    update.status = update.stockQuantity <= 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;
  }
  
  // If someone tries to manually set the status, we should ideally prevent it or ignore it,
  // but since we can't easily see the current stockQuantity here without a query,
  // we'll rely on the post-hook for complex updates like $inc.
  
  next();
});

// Post-hook for findOneAndUpdate to handle complex updates like $inc
productSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    const expectedStatus = doc.stockQuantity <= 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;
    if (doc.status !== expectedStatus) {
      // Use the model from the document's constructor to avoid circular dependency
      await doc.constructor.findByIdAndUpdate(doc._id, { status: expectedStatus });
    }
  }
});

import { getTenantDB } from "../../../config/db";

export const getProductModel = () => {
  const db = getTenantDB();
  return db.models.Product || db.model<IProduct>("Product", productSchema);
};
