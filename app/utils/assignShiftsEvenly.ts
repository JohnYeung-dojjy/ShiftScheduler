import { Schedule, Availability } from "../types";
import { MinHeap } from "./minHeap"; // Assume a MinHeap utility is available

export const assignShiftsEvenly = (
  employees: string[],
  daysOfWeek: string[],
  storeLocations: string[],
  availability: Availability,
  setSchedule: (schedule: Schedule) => void
) => {
  const updatedSchedule: Schedule = storeLocations.reduce((acc, location) => {
    acc[location] = daysOfWeek.reduce((dayAcc, day) => {
      dayAcc[day] = ""; // No employee assigned initially
      return dayAcc;
    }, {} as { [day: string]: string });
    return acc;
  }, {} as Schedule);

  const employeeShiftCount: { [employee: string]: number } = employees.reduce(
    (acc, employee) => {
      acc[employee] = 0;
      return acc;
    },
    {} as { [employee: string]: number }
  );

  const canAssignEmployee = (
    employee: string,
    day: string,
    location: string,
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

  const employeeHeap = new MinHeap<{ employee: string; shiftCount: number }>(
    (a: { employee: string; shiftCount: number }, b: { employee: string; shiftCount: number }) => a.shiftCount - b.shiftCount
  );

  employees.forEach((employee) => {
    const unavailableDays = Object.values(availability[employee] || {}).filter(
      (available) => !available
    ).length;
    employeeHeap.insert({ employee, shiftCount: -unavailableDays });
  });

  for (const day of daysOfWeek) {
    for (const location of storeLocations) {
      while (updatedSchedule[location][day] === "") { // While no employee is assigned
        const { employee, shiftCount } = employeeHeap.extractMin();

        if (canAssignEmployee(employee, day, location, updatedSchedule, availability)) {
          updatedSchedule[location][day] = employee;
        }
        // Increase shift count even if employee is not available, so it won't re-appear at the top immediately
        employeeHeap.insert({ employee, shiftCount: shiftCount + 1 });
      }
    }
  }

  setSchedule(updatedSchedule);
};
