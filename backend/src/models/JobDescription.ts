import mongoose, { Document, Schema } from "mongoose";

export interface IJobDescription extends Document {
  userId: mongoose.Types.ObjectId;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobDescriptionSchema = new Schema<IJobDescription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

jobDescriptionSchema.index({ userId: 1, createdAt: -1 });

export const JobDescription = mongoose.model<IJobDescription>(
  "JobDescription",
  jobDescriptionSchema,
);
