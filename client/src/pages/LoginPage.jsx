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
    <div className={`${BACKGROUNDS.subtle} flex-1 flex flex-col items-center justify-center min-h-screen`}>
      <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center transform -translate-y-12">
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-8 animate-fadeIn">ExamBuddy</h1>
        <LoginForm />
      </div>
    </div>
  );
}
