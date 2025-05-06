import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "../components/forms/LoginForm";

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
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <LoginForm />
    </div>
  );
}
