"use client";

import { useState } from "react";

interface Schedule {
  [location: string]: {
    [day: string]: string;
  };
}

interface Availability {
  [employee: string]: {
    [day: string]: boolean;
  };
}

export default function Home() {
  const daysOfWeek: string[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const storeLocations: string[] = ["Richmond", "Crystal Mall"];
  const employees: string[] = ["Alice", "Bob", "Charlie", "David", "Eve"];

  const [schedule, setSchedule] = useState<Schedule>(
    storeLocations.reduce((acc, location) => {
      acc[location] = daysOfWeek.reduce((dayAcc, day) => {
        dayAcc[day] = ""; // No employee assigned initially
        return dayAcc;
      }, {} as { [day: string]: string });
      return acc;
    }, {} as Schedule)
  );

  const [availability, setAvailability] = useState<Availability>(
    employees.reduce((acc, employee) => {
      acc[employee] = daysOfWeek.reduce((dayAcc, day) => {
        dayAcc[day] = true; // Available by default
        return dayAcc;
      }, {} as { [day: string]: boolean });
      return acc;
    }, {} as Availability)
  );

  const handleAssignShift = (
    location: string,
    day: string,
    employee: string
  ) => {
    setSchedule((prevSchedule) => {
      const updatedSchedule = { ...prevSchedule };
      // Ensure the employee is not already assigned to another store on the same day
      for (const loc of storeLocations) {
        if (updatedSchedule[loc][day] === employee) {
          updatedSchedule[loc][day] = "";
        }
      }
      updatedSchedule[location][day] = employee;
      return updatedSchedule;
    });
  };

  const handleAvailabilityChange = (
    employee: string,
    day: string
  ) => {
    setAvailability((prevAvailability) => {
      const updatedAvailability = {
        ...prevAvailability,
        [employee]: {
          ...prevAvailability[employee],
          [day]: !prevAvailability[employee][day],
        },
      };
      return updatedAvailability;
    });
  };

  const assignShiftsEvenly = () => {
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
          if (
            availability[employee][day] &&
            !Object.values(updatedSchedule).some(
              (store) => store[day] === employee
            )
          ) {
            updatedSchedule[location][day] = employee;
            employeeShiftCount[employee]++;
            assigned = true;
            break;
          }
        }

        // If no employee is available, assign the least busy employee
        if (!assigned) {
          const leastBusyEmployee = employees.sort(
            (a, b) => employeeShiftCount[a] - employeeShiftCount[b]
          )[0];
          updatedSchedule[location][day] = leastBusyEmployee;
          employeeShiftCount[leastBusyEmployee]++;
        }
      }
    }

    setSchedule(updatedSchedule);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Shift Scheduler</h1>

      <button
        onClick={assignShiftsEvenly}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Assign Shifts Evenly
      </button>

      {/* Availability Table */}
      <h2 className="text-xl font-semibold mb-4">Employee Availability</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full mb-8">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 w-32">Employee</th>
            {daysOfWeek.map((day) => (
              <th key={day} className="border border-gray-300 px-4 py-2 w-32">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee}>
              <td className="border border-gray-300 px-4 py-2 font-semibold w-32">
                {employee}
              </td>
              {daysOfWeek.map((day) => (
                <td
                  key={day}
                  className={`border border-gray-300 px-4 py-2 text-center cursor-pointer w-32 ${availability[employee][day] ? "bg-green-500" : "bg-red-500"}`}
                  onClick={() => handleAvailabilityChange(employee, day)}
                >
                  {availability[employee][day] ? "Available" : "Unavailable"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Shift Scheduler Table */}
      <h2 className="text-xl font-semibold mb-4">Shift Assignments</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 w-32">Store Location</th>
            {daysOfWeek.map((day) => (
              <th key={day} className="border border-gray-300 px-4 py-2 w-32">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {storeLocations.map((location) => (
            <tr key={location}>
              <td className="border border-gray-300 px-4 py-2 font-semibold w-32">{location}</td>
              {daysOfWeek.map((day) => (
                <td key={day} className="border border-gray-300 px-4 py-2 w-32">
                  <select
                    value={schedule[location][day]}
                    onChange={(e) => handleAssignShift(location, day, e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map((employee) => (
                      <option key={employee} value={employee}>
                        {employee}
                      </option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
