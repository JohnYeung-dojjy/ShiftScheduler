import { Schedule, Availability } from "../types";

const canAssignEmployee = (
    employee: string,
    day: string,
    updatedSchedule: Schedule,
    availability: Availability,
    shift: string // shift is now passed as an argument
  ): boolean => {
  const isAvailableOnDay = availability[employee]?.[shift]?.[day];
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
    shifts.forEach((shift) => {
      const availableDays = Object.values(availability[employee]?.[shift] || {}).filter(
        (available) => available
      ).length;
      employeeAvailabilityCount[employee] = (employeeAvailabilityCount[employee] || 0) + availableDays;
    });
  });

  const employeeShiftCount: { [employee: string]: number } = employees.reduce((acc, employee) => {
    acc[employee] = 0; // Initialize shift count to 0 for each employee
    return acc;
  }, {} as { [employee: string]: number });

  let unassignableShifts = 0;

  for (const day of daysOfWeek) {
    for (const shift of shifts) {
      const sortedEmployees = Object.entries(employeeShiftCount)
        .sort(([, shiftCountA], [, shiftCountB]) => shiftCountA - shiftCountB)
        .map(([employee]) => employee);

      for (const employee of sortedEmployees) {
        if (
          canAssignEmployee(employee, day, updatedSchedule, availability, shift)
        ) {
          updatedSchedule[shift][day] = employee;
          employeeShiftCount[employee] += 1; // Increment shift count for the assigned employee
          break;
        }
      }
      if (updatedSchedule[shift][day] === "") {
        unassignableShifts++;
      }
    }
  }
  // TODO: Rearrange shifts for that day if unassignable shifts exist, maybe someone was available but has already been assigned to another shift
  if (unassignableShifts > 0) {
    alert(`Warning: ${unassignableShifts} shifts could not be assigned due to availability constraints, please check if you could re-arrange shifts for that day.`);
  }

  setSchedule(updatedSchedule);
};
