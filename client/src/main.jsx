import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import PracticePage from "./pages/PracticePage";
import TestPage from "./pages/TestPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CalculatorPage from "./pages/CalculatorPage";
import { SubjectProvider } from "./contexts/SubjectContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="test" element={<TestPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
