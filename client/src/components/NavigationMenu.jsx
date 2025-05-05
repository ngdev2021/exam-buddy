import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSubject } from "../contexts/SubjectContext";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/practice", label: "Practice" },
  { path: "/test", label: "Test Mode" },
  { path: "/dashboard", label: "Dashboard" }
];

export default function NavigationMenu() {
  // Only show on md+ screens

  const location = useLocation();
  const { subjects, selectedSubject, setSelectedSubject } = useSubject();
  return (
    <nav className="w-full bg-white shadow sticky top-0 z-50 mb-6 md:flex hidden">
      <div className="max-w-4xl mx-auto px-4 flex items-center h-14">
        <span className="font-bold text-xl text-blue-700 tracking-wide mr-8">ExamBuddy</span>
        <ul className="flex gap-5 flex-1">
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`py-2 px-3 rounded transition font-medium ${location.pathname === item.path ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-100"}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div>
          <select
            className="border p-2 rounded"
            value={selectedSubject.name}
            onChange={e => {
              const subj = subjects.find(s => s.name === e.target.value);
              setSelectedSubject(subj);
            }}
          >
            {subjects.map(s => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
