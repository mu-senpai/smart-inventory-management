import { getActivityLogModel } from "../api/v1/activity-log/activity-log.model";

const MAX_LOGS = 10;

/**
 * Logs an action to the ActivityLog collection.
 * Keeps only the latest MAX_LOGS entries by deleting the oldest when the cap is reached.
 */
export const logActivity = async (action: string): Promise<void> => {
  try {
    const ActivityLog = getActivityLogModel();
    await ActivityLog.create({ action });

    const count = await ActivityLog.countDocuments();
    if (count > MAX_LOGS) {
      const oldest = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(count - MAX_LOGS)
        .select("_id");

      await ActivityLog.deleteMany({
        _id: { $in: oldest.map((doc) => doc._id) },
      });
    }
  } catch (error) {
    console.error("Activity log error:", error);
  }
};
