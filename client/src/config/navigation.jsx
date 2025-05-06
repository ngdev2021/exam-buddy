import React from "react";
import { HomeIcon, ClipboardIcon, PencilIcon, UserCircleIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export const navigationItems = [
  { path: "/", label: "Home", icon: <HomeIcon className="w-6 h-6" /> },
  { path: "/practice", label: "Practice", icon: <PencilIcon className="w-6 h-6" /> },
  { path: "/test", label: "Test Mode", icon: <ClipboardIcon className="w-6 h-6" /> },
  { path: "/dashboard", label: "Dashboard", icon: <UserCircleIcon className="w-6 h-6" /> },
  { path: "/calculator", label: "Calculator", icon: <CalculatorIcon className="w-6 h-6" /> }
];
