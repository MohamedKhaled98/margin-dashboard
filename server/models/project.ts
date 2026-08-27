import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    refCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    salesYear: {
      type: Number,
      required: true,
    },

    salesMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    category: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model("Project", projectSchema);