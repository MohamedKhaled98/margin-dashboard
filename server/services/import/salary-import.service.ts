import { Employee } from "../../models/employee.js";
import { MonthlySalary } from "../../models/monthly-salary.js";
import type { ParsedSalary } from "../../parsers/salary.parser.js";


export async function importSalaries(
  salaries: ParsedSalary[]
) {
  const employees = new Map<
    string,
    { employeeNo: string; name: string }
  >();

  for (const salary of salaries) {
    employees.set(salary.employeeNo, {
      employeeNo: salary.employeeNo,
      name: salary.employeeName,
    });
  }

  const employeeOperations = [...employees.values()].map(
    (employee) => ({
      updateOne: {
        filter: {
          employeeNo: employee.employeeNo,
        },
        update: {
          $set: {
            name: employee.name,
          },
        },
        upsert: true,
      },
    })
  );

  await Employee.bulkWrite(employeeOperations);

  const salaryOperations = salaries.map((salary) => ({
    updateOne: {
      filter: {
        employeeNo: salary.employeeNo,
        year: salary.year,
        month: salary.month,
      },
      update: {
        $set: {
          amount: salary.amount,
        },
      },
      upsert: true,
    },
  }));

  await MonthlySalary.bulkWrite(salaryOperations);
}