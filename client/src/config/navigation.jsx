import React from "react";
import { HomeIcon, ClipboardIcon, PencilIcon, UserCircleIcon, CalculatorIcon, MicrophoneIcon, AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export const navigationItems = [
  { path: "/", label: "Home", icon: <HomeIcon className="w-6 h-6" /> },
  { path: "/practice", label: "Practice", icon: <PencilIcon className="w-6 h-6" /> },
  { path: "/test", label: "Test Mode", icon: <ClipboardIcon className="w-6 h-6" /> },
  { path: "/dashboard", label: "Dashboard", icon: <UserCircleIcon className="w-6 h-6" /> },
  { path: "/lessons", label: "Lessons", icon: <BookOpenIcon className="w-6 h-6" /> },
  { path: "/calculator", label: "Calculator", icon: <CalculatorIcon className="w-6 h-6" /> },
  { path: "/voice-demo", label: "Voice Demo", icon: <MicrophoneIcon className="w-6 h-6" /> },
  { path: "/voice-flashcards", label: "Voice Cards", icon: <MicrophoneIcon className="w-6 h-6" /> },
  { path: "/voice-exam", label: "Voice Exam", icon: <MicrophoneIcon className="w-6 h-6" /> }
];
