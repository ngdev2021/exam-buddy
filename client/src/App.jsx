import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import NavigationMenu from "./components/NavigationMenu";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import PracticePage from "./pages/PracticePage";
import TestPage from "./pages/TestPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Outlet } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="w-full flex items-center gap-4 p-4 bg-white border-b mb-4">
      <Link to="/" className="font-bold text-blue-700 text-lg">ExamBuddy</Link>
      <Link to="/practice">Practice</Link>
      <Link to="/test">Test</Link>
      <Link to="/dashboard">Dashboard</Link>
      <div className="flex-1" />
      {user ? (
        <button onClick={() => { logout(); navigate("/login"); }} className="bg-gray-200 px-3 py-1 rounded">Logout</button>
      ) : (
        <>
          <Link to="/login" className="text-blue-600">Login</Link>
          <Link to="/register" className="text-green-600">Register</Link>
        </>
      )}
    </nav>
  );
}

function AppRoutes() {
  return (
    <>
      <NavBar />
      <ErrorBoundary>
        <Routes>
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50">
              <main className="max-w-4xl mx-auto pt-8 pb-24 px-4">
                <Outlet />
              </main>
            </div>
          }>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="test" element={<TestPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          {/* Optionally, add a catch-all 404 route here */}
        </Routes>
      </ErrorBoundary>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
