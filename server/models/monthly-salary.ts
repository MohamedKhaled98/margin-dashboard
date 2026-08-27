import mongoose, { Schema } from "mongoose";

const monthlySalarySchema = new Schema(
  {
    employeeNo: {
      type: String,
      required: true,
      index: true,
    },

    year: {
      type: Number,
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

monthlySalarySchema.index(
  { employeeNo: 1, year: 1, month: 1 },
  { unique: true }
);

export const MonthlySalary = mongoose.model(
  "MonthlySalary",
  monthlySalarySchema
);