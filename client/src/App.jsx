import React from "react";
import { Routes, Route } from "react-router-dom";
import NavigationMenu from "./components/NavigationMenu";
import MobileNavBar from "./components/MobileNavBar";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import PracticePage from "./pages/PracticePage";
import TestPage from "./pages/TestPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CalculatorPage from "./pages/CalculatorPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Navigation is now handled by NavigationMenu and MobileNavBar components

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <NavigationMenu />
      <MobileNavBar />
      <ErrorBoundary>
        <main className="max-w-4xl mx-auto pt-8 pb-24 px-4">
          <Routes>
            {/* Public routes */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route index element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="practice" element={
              <ProtectedRoute>
                <PracticePage />
              </ProtectedRoute>
            } />
            <Route path="test" element={
              <ProtectedRoute>
                <TestPage />
              </ProtectedRoute>
            } />
            <Route path="calculator" element={
              <ProtectedRoute>
                <CalculatorPage />
              </ProtectedRoute>
            } />
            
            {/* Catch-all 404 route */}
            <Route path="*" element={<div className="text-center py-10"><h2 className="text-2xl font-bold">Page Not Found</h2><p>The page you're looking for doesn't exist.</p></div>} />
          </Routes>
        </main>
      </ErrorBoundary>
    </div>
  );
}

export default App;
