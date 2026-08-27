import { Project } from "../../models/project.js";
import type { ParsedProject } from "../../parsers/project.parser.js";


export async function importProjects(
  projects: ParsedProject[]
) {
  if (projects.length === 0) return;

  const operations = projects.map((project) => ({
    updateOne: {
      filter: {
        refCode: project.refCode,
      },

      update: {
        $set: {
          name: project.name,
          price: project.price,
          salesYear: project.salesYear,
          salesMonth: project.salesMonth,
          category: project.category,
          status: project.status,
        },
      },

      upsert: true,
    },
  }));

  await Project.bulkWrite(operations);
}