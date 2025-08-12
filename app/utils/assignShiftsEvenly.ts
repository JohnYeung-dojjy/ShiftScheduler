import { Schedule, Availability } from "../types";

const canAssignEmployee = (
    employee: string,
    day: string,
    updatedSchedule: Schedule,
    availability: Availability
  ): boolean => {
  const isAvailableOnDay = availability[employee]?.[day];
  const notAssignedToAnotherLocation = !Object.keys(updatedSchedule).some(
    (loc) => updatedSchedule[loc][day] === employee
  );

  return (
    isAvailableOnDay && notAssignedToAnotherLocation
  );
};
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export const assignShiftsEvenly = (
  employees: string[],
  daysOfWeek: string[],
  shifts: string[],
  availability: Availability,
  setSchedule: (schedule: Schedule) => void
) => {
  const updatedSchedule: Schedule = shifts.reduce((acc, shift) => {
    acc[shift] = daysOfWeek.reduce((dayAcc, day) => {
      dayAcc[day] = ""; // No employee assigned initially
      return dayAcc;
    }, {} as { [day: string]: string });
    return acc;
  }, {} as Schedule);

  const employeeAvailabilityCount: { [employee: string]: number } = {};

  employees.forEach((employee) => {
    const availableDays = Object.values(availability[employee] || {}).filter(
      (available) => available
    ).length;
    employeeAvailabilityCount[employee] = availableDays;
  });

  for (const day of daysOfWeek) {
    for (const shift of shifts) {
      let assigned = false;
      // slower than min-Heap but easier to loop over each employee.
      // data size is small so it should be fine.
      const sortedEmployees = Object.entries(employeeAvailabilityCount)
      .sort(([, availableDaysA], [, availableDaysB]) => availableDaysB - availableDaysA)
      .map(([employee]) => employee);
      for (const employee of sortedEmployees) {
        if (
          employeeAvailabilityCount[employee] > 0 &&
          canAssignEmployee(employee, day, updatedSchedule, availability)
        ) {
          updatedSchedule[shift][day] = employee;
          employeeAvailabilityCount[employee] -= 1;
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        alert("Not enough employees to fill all shifts.");
        return;
      }
    }
  }

  setSchedule(updatedSchedule);
};
