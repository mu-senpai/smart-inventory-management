import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

import { getTenantDB } from "../../../config/db";

export const getCategoryModel = () => {
  const db = getTenantDB();
  return db.models.Category || db.model<ICategory>("Category", categorySchema);
};
