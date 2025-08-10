import { Schedule, Availability } from "../types";

export const assignShiftsEvenly = (
  employees: string[],
  daysOfWeek: string[],
  storeLocations: string[],
  availability: Availability,
  schedule: Schedule,
  setSchedule: (schedule: Schedule) => void
) => {
  const updatedSchedule: Schedule = { ...schedule };
  const employeeShiftCount: { [employee: string]: number } = employees.reduce(
    (acc, employee) => {
      acc[employee] = 0;
      return acc;
    },
    {} as { [employee: string]: number }
  );

  for (const day of daysOfWeek) {
    for (const location of storeLocations) {
      let assigned = false;
      for (const employee of employees.sort(
        (a, b) => employeeShiftCount[a] - employeeShiftCount[b]
      )) {
        // Ensure the employee is available on the specific day and not already assigned elsewhere
        if (
          availability[employee]?.[day] &&
          !Object.values(updatedSchedule as { [key: string]: string }).some(
            (store) => store === employee
          )
        ) {
          updatedSchedule[location][day] = employee;
          employeeShiftCount[employee]++;
          assigned = true;
          break;
        }
      }

      // If no employee is available, leave the shift unassigned
      if (!assigned) {
        updatedSchedule[location][day] = "";
      }
    }
  }

  setSchedule(updatedSchedule);
};
