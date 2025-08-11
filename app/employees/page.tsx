"use client";

import { useState, useEffect } from "react";
import Head from "next/head";

export default function Employees() {
  const [employees, setEmployees] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, Record<string, boolean>>>({});

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
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("availability", JSON.stringify(availability));
  }, [availability]);

  const addEmployee = (employeeName: string) => {
    if (!employeeName || employees.includes(employeeName)) return;
    if (employees.length >= 28) {
      alert("Cannot add more than 28 employees.");
      return;
    }
    setEmployees((prev) => [...prev, employeeName]);
    setAvailability((prev) => ({
      ...prev,
      [employeeName]: {},
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

  return (
    <div className="p-8">
      <Head>
        <title>Manage Employees</title>
      </Head>
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

      <div className="mt-4 flex justify-start">
        <a
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
