import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
  {
    employeeNo: {
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

    department: {
      type: String,
      default: null,
    },

    designation: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Employee = mongoose.model("Employee", employeeSchema);