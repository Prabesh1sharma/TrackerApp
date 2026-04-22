import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type LogStatus = "completed" | "missed" | "excused";

export interface IActivityLog extends Document {
  userId: Types.ObjectId;
  activityId: Types.ObjectId;
  date: Date;
  status: LogStatus;
  reason: string;
  remark: string;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityId: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "missed", "excused"],
      required: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Reason cannot exceed 300 characters"],
    },
    remark: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Remark cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate logs for the same activity on the same day
ActivityLogSchema.index(
  { userId: 1, activityId: 1, date: 1 },
  { unique: true }
);

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
