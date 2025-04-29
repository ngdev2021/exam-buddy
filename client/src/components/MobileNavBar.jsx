import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HomeIcon, ClipboardIcon, PencilIcon, UserCircleIcon } from "@heroicons/react/24/outline";
const navItems = [
  { path: "/", label: "Home", icon: <HomeIcon className="w-6 h-6" /> },
  { path: "/practice", label: "Practice", icon: <PencilIcon className="w-6 h-6" /> },
  { path: "/test", label: "Test", icon: <ClipboardIcon className="w-6 h-6" /> },
  { path: "/dashboard", label: "Dashboard", icon: <UserCircleIcon className="w-6 h-6" /> }
];

export default function MobileNavBar() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around py-1 z-50 md:hidden border-t">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center text-xs font-medium px-2 py-1 transition-colors ${location.pathname === item.path ? "text-blue-600" : "text-gray-500 hover:text-blue-400"}`}
          aria-label={item.label}
        >
          {item.icon}
          <span className="mt-0.5">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
