import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema(
  {
    billableCategories: {
      type: [String],
      default: ["Projects", "Enhancements", "Hosting"],
    },

    monthlyOverhead: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model("Settings", settingsSchema);