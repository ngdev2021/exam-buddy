import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SubjectProvider } from "./contexts/SubjectContext";
import { QueryProvider } from "./context/QueryProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { AppearanceProvider } from "./context/AppearanceContext";
import { VoiceProvider } from "./context/VoiceContext";
import { setupMockApiInterceptors } from "./utils/mockApiService";
import './styles/appearance.css';
import "./index.css";

// Setup mock API interceptors if using mock authentication
if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
  setupMockApiInterceptors();
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <SubjectProvider>
              <AppearanceProvider>
                <VoiceProvider>
                  <App />
                </VoiceProvider>
              </AppearanceProvider>
            </SubjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
