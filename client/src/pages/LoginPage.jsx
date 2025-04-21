import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to intended page or home
  useEffect(() => {
    if (token) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [token, location, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Login</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <input
          type="email"
          className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border p-2 rounded mb-4"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 font-bold hover:bg-blue-700" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-4 text-sm text-center">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
        </div>
      </form>
    </div>
  );
}
