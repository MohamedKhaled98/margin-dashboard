import { Settings } from "../../models/settings.js";
import { TimesheetEntry } from "../../models/timesheet.js";
import { getAssumptions } from "../calc/rate.service.js";

export type SettingsInput = {
  billableCategories: string[];
  monthlyOverhead: number;
};

// Current assumptions plus every category seen in the timesheet,
// so the UI can offer real choices instead of free text.
export async function getSettingsData() {
  const [assumptions, categories] = await Promise.all([
    getAssumptions(),
    TimesheetEntry.distinct("category"),
  ]);

  return {
    ...assumptions,
    availableCategories: categories.sort(),
  };
}

export async function updateSettingsData(input: SettingsInput) {
  await Settings.findOneAndUpdate(
    {},
    { $set: input },
    { upsert: true }
  );

  return getSettingsData();
}
