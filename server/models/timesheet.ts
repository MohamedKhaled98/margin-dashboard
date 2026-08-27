import mongoose, { Schema } from "mongoose";

const timesheetEntrySchema = new Schema(
  {
    year: {
      type: Number,
      required: true,
      index: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },

    employeeNo: {
      type: String,
      required: true,
      index: true,
    },

    employeeName: {
      type: String,
      required: true,
    },

    expenseType: {
      type: String, // DL | IDL
      required: true,
    },

    department: {
      type: String,
      default: null,
    },

    designation: {
      type: String,
      default: null,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    refCode: {
      type: String,
      default: null,
      index: true,
    },

    projectName: {
      type: String,
      default: null,
    },

    company: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },

    hours: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const TimesheetEntry = mongoose.model(
  "TimesheetEntry",
  timesheetEntrySchema
);