"use client";

import { useState, useEffect } from "react";
import { Schedule, Availability } from "./types";
import { assignShiftsEvenly } from "./utils/assignShiftsEvenly";
import Head from "next/head";
import Link from "next/link";

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
  const [shifts, setShifts] = useState<string[]>([]);

  const [employees, setEmployees] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<Schedule>(
    shifts.reduce((acc, shift) => {
      acc[shift] = daysOfWeek.reduce((dayAcc, day) => {
        dayAcc[day] = ""; // No employee assigned initially
        return dayAcc;
      }, {} as { [day: string]: string });
      return acc;
    }, {} as Schedule)
  );
  const [availability, setAvailability] = useState<Availability>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedShifts = localStorage.getItem("shifts");
      if (storedShifts) {
        setShifts(JSON.parse(storedShifts));
      }

      const storedEmployees = localStorage.getItem("employees");
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees));
      }

      const storedAvailability = localStorage.getItem("availability");
      if (storedAvailability) {
        setAvailability(JSON.parse(storedAvailability));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("availability", JSON.stringify(availability));
  }, [availability]);

  const handleAssignShift = (
    shift: string,
    day: string,
    employee: string
  ) => {
    setSchedule((prevSchedule) => {
      const updatedSchedule = { ...prevSchedule };
      // Ensure the employee is not already assigned to another store on the same day
      for (const shift of shifts) {
        if (updatedSchedule[shift][day] === employee) {
          updatedSchedule[shift][day] = "";
        }
      }
      updatedSchedule[shift][day] = employee;
      return updatedSchedule;
    });
  };

  const handleAvailabilityChange = (
    employee: string,
    shift: string,
    day: string
  ) => {
    setAvailability((prevAvailability) => {
      const updatedAvailability = {
        ...prevAvailability,
        [employee]: {
          ...prevAvailability[employee],
          [shift]: {
            ...prevAvailability[employee]?.[shift],
            [day]: !prevAvailability[employee]?.[shift]?.[day],
          },
        },
      };
      return updatedAvailability;
    });
  };

  /**
   * Toggles the availability of an employee for the entire week.
   * If the employee is fully available, they will be marked unavailable for all days.
   * If the employee is partially or fully unavailable, they will be marked available for all days.
   */
  const toggleEmployeeAvailability = (employee: string) => {
    setAvailability((prevAvailability) => {
      const updatedAvailability = {
        ...prevAvailability,
        [employee]: shifts.reduce((shiftAcc, shift) => {
          shiftAcc[shift] = daysOfWeek.reduce((dayAcc, day) => {
            dayAcc[day] = !Object.values(
              prevAvailability[employee]?.[shift] || {}
            ).every((available) => available);
            return dayAcc;
          }, {} as { [day: string]: boolean });
          return shiftAcc;
        }, {} as { [shift: string]: { [day: string]: boolean } }),
      };
      return updatedAvailability;
    });
  };

  /**
   * Toggles the availability of a specific shift for an employee.
  */
  const toggleShiftAvailability = (employee: string, shift: string) => {
    setAvailability((prevAvailability) => {
      const updatedAvailability = {
        ...prevAvailability,
        [employee]: {
          ...prevAvailability[employee],
          [shift]: daysOfWeek.reduce((dayAcc, day) => {
            dayAcc[day] = !Object.values(prevAvailability[employee]?.[shift] || {}).every(
              (available) => available
            );
            return dayAcc;
          }, {} as { [day: string]: boolean }),
        },
      };
      return updatedAvailability;
    });
  };

  const distinctColors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF", "#33FFF5", "#F5FF33", "#FF8C33", "#8C33FF", "#33FF8C",
    "#FFC300", "#DAF7A6", "#581845", "#900C3F", "#C70039", "#FF5733", "#FFC300", "#DAF7A6", "#581845", "#900C3F",
    "#C70039", "#FF5733", "#FFC300", "#DAF7A6", "#581845", "#900C3F", "#C70039", "#FF5733"
  ];

  const employeeColors: { [key: string]: string } = employees.sort().reduce((acc: { [key: string]: string }, employee, index) => {
    acc[employee] = distinctColors[index % distinctColors.length];
    return acc;
  }, {});

  /**
   * Determines the appropriate text color (black or white) based on the brightness of the background color.
   * This ensures that the text remains readable regardless of the background color.
   * @param bgColor - The background color in hexadecimal format (e.g., "#FFFFFF").
   * @returns The text color as a hexadecimal string ("#000000" for black or "#FFFFFF" for white).
   */
  const getTextColor = (bgColor: string): string => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  };

  return (
    <div className="p-8">
      <Head>
        <title>Shift Scheduler</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Shift Scheduler</h1>

      <div className="mb-4">
        <Link
          href="/configs"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit Configurations
        </Link>
      </div>

      {/* Availability Table */}
      <h2 className="text-xl font-semibold mb-4">Employee Availability</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full mb-8">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 w-32">Employee</th>
            <th className="border border-gray-300 px-4 py-2 w-32">Shift</th>
            {
              daysOfWeek.map((day) => (
                <th key={`${day}`} className="border border-gray-300 px-4 py-2 w-32">
                  {day}
                </th>
              )
            )}
            <th className="border border-gray-300 px-4 py-2 w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.sort().map((employee) => (
            <tr key={employee}>
              <td
                className="border border-gray-300 px-4 py-2 font-semibold w-32"
                style={{
                  backgroundColor: employeeColors[employee],
                  color: getTextColor(employeeColors[employee]),
                }}
              >
                {employee}
              </td>
              <td colSpan={daysOfWeek.length + 2}>
                <table className="table-auto border-collapse border border-gray-300 w-full">
                  <tbody>
                    {shifts.map((shift) => (
                      <tr key={`${employee}-${shift}`}>
                        <td className="border border-gray-300 px-4 py-2 font-semibold w-32">
                          {shift}
                        </td>
                        {daysOfWeek.map((day) => (
                          <td
                            key={`${employee}-${shift}-${day}`}
                            className={`border border-gray-300 px-4 py-2 text-center cursor-pointer w-32 ${availability[employee]?.[shift]?.[day] ? "bg-green-500" : "bg-red-500"}`}
                            onClick={() => handleAvailabilityChange(employee, shift, day)}
                          >
                            {availability[employee]?.[shift]?.[day] ? "✓" : ""}
                          </td>
                        ))}
                        <td className="border border-gray-300 px-4 py-2 w-32">
                          <button
                            onClick={() => toggleShiftAvailability(employee, shift)}
                            className="px-2 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                          >
                            Toggle Shift
                          </button>
                        </td>
                        </tr>
                        )
                      )
                    }
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() =>
          assignShiftsEvenly(
            employees,
            daysOfWeek,
            shifts,
            availability,
            setSchedule
          )
        }
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Assign Shifts Evenly
      </button>
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
          {shifts.map((shift) => (
            <tr key={shift}>
              <td className="border border-gray-300 px-4 py-2 font-semibold w-32">{shift}</td>
              {daysOfWeek.map((day) => (
                <td
                  key={day}
                  className="border border-gray-300 px-4 py-2 w-32"
                  style={{
                    backgroundColor: schedule[shift]?.[day] ? employeeColors[schedule[shift]?.[day]] : "",
                    color: schedule[shift]?.[day] ? getTextColor(employeeColors[schedule[shift]?.[day]]) : "",
                  }}
                >
                  <select
                    value={schedule[shift]?.[day]}
                    onChange={(e) => handleAssignShift(shift, day, e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="" style={{ color: "#000000" }}>-- Select Employee --</option>
                    {employees.map((employee) => (
                      <option key={employee} value={employee} style={{ color: "#000000" }}>
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
