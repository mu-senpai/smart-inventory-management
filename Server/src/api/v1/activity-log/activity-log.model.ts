import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  action: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: {
      type: String,
      required: [true, "Action description is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

import { getTenantDB } from "../../../config/db";

export const getActivityLogModel = () => {
  const db = getTenantDB();
  return db.models.ActivityLog || db.model<IActivityLog>("ActivityLog", activityLogSchema);
};
