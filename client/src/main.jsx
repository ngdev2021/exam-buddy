import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SubjectProvider } from "./contexts/SubjectContext";
import { QueryProvider } from "./context/QueryProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { AppearanceProvider } from "./context/AppearanceContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <SubjectProvider>
              <AppearanceProvider>
                <App />
              </AppearanceProvider>
            </SubjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
