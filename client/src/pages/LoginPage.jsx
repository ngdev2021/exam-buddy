import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "../components/forms/LoginForm";
import { BACKGROUNDS, SPACING } from "../styles/theme";

export default function LoginPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to intended page or home
  useEffect(() => {
    if (token) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [token, location, navigate]);

  return (
    <div className={`${BACKGROUNDS.subtle} flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-6`}>
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 flex flex-col items-center transform -translate-y-6 sm:-translate-y-12">
        <div className="mb-8 flex flex-col items-center animate-fadeIn">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 text-center">ExamBuddy</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-center text-sm sm:text-base">Your personal study companion</p>
        </div>
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-8 animate-fadeIn">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
