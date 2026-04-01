import { getActivityLogModel } from "./activity-log.model";

export const getLatest = async () => {
  const ActivityLog = getActivityLogModel();
  return ActivityLog.find().sort({ createdAt: -1 }).limit(10);
};
