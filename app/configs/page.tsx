"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function Configurations() {
  const [shifts, setShifts] = useState<string[]>([]);
  const [employees, setEmployees] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, Record<string, { [day: string]: boolean }>>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmployees = localStorage.getItem("employees");
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees));
      }

      const storedAvailability = localStorage.getItem("availability");
      if (storedAvailability) {
        setAvailability(JSON.parse(storedAvailability));
      }

      const storedShifts = localStorage.getItem("shifts");
      if (storedShifts) {
        setShifts(JSON.parse(storedShifts));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("availability", JSON.stringify(availability));
  }, [availability]);

  useEffect(() => {
    localStorage.setItem("shifts", JSON.stringify(shifts));
  }, [shifts]);

  const addEmployee = (employeeName: string) => {
    if (!employeeName || employees.includes(employeeName)) return;
    if (employees.length >= 28) {
      alert("Cannot add more than 28 employees.");
      return;
    }
    setEmployees((prev) => [...prev, employeeName]);
    setAvailability((prev) => ({
      ...prev,
      [employeeName]: shifts.reduce((acc, shift) => {
        acc[shift] = {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        };
        return acc;
      }, {} as Record<string, { [day: string]: boolean }>),
    }));
  };

  const deleteEmployee = (employee: string) => {
    if (confirm(`Are you sure you want to delete ${employee}?`)) {
      setEmployees((prevEmployees) => prevEmployees.filter((e) => e !== employee));
      setAvailability((prevAvailability) => {
        const updatedAvailability = { ...prevAvailability };
        delete updatedAvailability[employee];
        return updatedAvailability;
      });
    }
  };

  const addShift = (shiftName: string) => {
    if (!shiftName || shifts.includes(shiftName)) return;
    setShifts((prev) => {
      const updatedShifts = [...prev, shiftName];
      localStorage.setItem("shifts", JSON.stringify(updatedShifts));
      return updatedShifts;
    });

    setAvailability((prev) => {
      const updatedAvailability = { ...prev };
      employees.forEach((employee) => {
        updatedAvailability[employee] = {
          ...updatedAvailability[employee],
          [shiftName]: {
            Monday: true,
            Tuesday: true,
            Wednesday: true,
            Thursday: true,
            Friday: true,
            Saturday: true,
            Sunday: true,
          },
        };
      });
      localStorage.setItem("availability", JSON.stringify(updatedAvailability));
      return updatedAvailability;
    });
  };

  const deleteShift = (shift: string) => {
    if (confirm(`Are you sure you want to delete the shift: ${shift}?`)) {
      setShifts((prevShifts) => {
        const updatedShifts = prevShifts.filter((s) => s !== shift);
        localStorage.setItem("shifts", JSON.stringify(updatedShifts));
        return updatedShifts;
      });

      setAvailability((prevAvailability) => {
        const updatedAvailability = { ...prevAvailability };
        employees.forEach((employee) => {
          if (updatedAvailability[employee]) {
            delete updatedAvailability[employee][shift];
          }
        });
        localStorage.setItem("availability", JSON.stringify(updatedAvailability));
        return updatedAvailability;
      });
    }
  };

  return (
    <div className="p-8">
      <Head>
        <title>Configurations</title>
      </Head>
      <div className="mt-4 flex justify-end">
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Home
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Manage Employees</h1>

      <div className="mb-4">
        <input
          type="text"
          id="new-employee"
          placeholder="Enter employee name"
          className="border border-gray-300 rounded px-2 py-1 mr-2"
        />
        <button
          onClick={() => {
            const input = document.getElementById("new-employee") as HTMLInputElement;
            addEmployee(input.value);
            input.value = "";
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Employee
        </button>
      </div>

      <ul className="grid grid-cols-[1fr_auto] gap-y-0.5 items-center max-w-md">
        {employees.map((employee) => (
          <li key={employee} className="contents">
            <span className="px-2 py-1">{employee}</span>
            <button
              onClick={() => deleteEmployee(employee)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mt-8 mb-4">Manage Shifts</h2>

      <div className="mb-4">
        <input
          type="text"
          id="new-shift"
          placeholder="Enter shift name"
          className="border border-gray-300 rounded px-2 py-1 mr-2"
        />
        <button
          onClick={() => {
            const input = document.getElementById("new-shift") as HTMLInputElement;
            addShift(input.value);
            input.value = "";
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Shift
        </button>
      </div>

      <ul className="grid grid-cols-[1fr_auto] gap-y-0.5 items-center max-w-md">
        {shifts.map((shift) => (
          <li key={shift} className="contents">
            <span className="px-2 py-1">{shift}</span>
            <button
              onClick={() => deleteShift(shift)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
