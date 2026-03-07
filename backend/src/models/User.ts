import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  googleId?: string;
  password?: string;
  picture?: string;
  preferences: {
    theme: "light" | "dark" | "system";
    defaultTemplate?: string;
    notifications: boolean;
  };
  subscription: {
    plan: "free" | "pro";
    credits: number;
    expiresAt?: Date;
  };
  lastFreeCreditDate?: Date;
  freeCreditsUsedToday?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    picture: {
      type: String,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      defaultTemplate: {
        type: String,
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free",
      },
      credits: {
        type: Number,
        default: 100,
      },
      expiresAt: {
        type: Date,
      },
    },
    lastFreeCreditDate: {
      type: Date,
    },
    freeCreditsUsedToday: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
