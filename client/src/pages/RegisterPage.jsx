import React from "react";
import RegisterForm from "../components/forms/RegisterForm";
import { BACKGROUNDS, SPACING } from "../styles/theme";

export default function RegisterPage() {
  return (
    <div className={`${BACKGROUNDS.subtle} flex-1 flex flex-col items-center justify-center min-h-screen`}>
      <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center transform -translate-y-12">
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-8 animate-fadeIn">ExamBuddy</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
