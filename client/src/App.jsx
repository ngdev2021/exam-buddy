import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { BACKGROUNDS, SPACING, BORDERS, TEXT } from "./styles/theme";
import SideNavigation from "./components/SideNavigation";
import VoiceCommandHandler from "./components/voice/VoiceCommandHandler";
import GlobalTutor from "./components/chatbot/GlobalTutor";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import PracticePage from "./pages/PracticePage";
import TestPage from "./pages/TestPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CalculatorPage from "./pages/CalculatorPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import VoiceDemoPage from "./pages/VoiceDemoPage";
import VoiceFlashcardPage from "./pages/VoiceFlashcardPage";
import VoiceExamPage from "./pages/VoiceExamPage";
import VoiceSettingsPage from "./pages/VoiceSettingsPage";
import TutorPage from "./pages/TutorPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./context/AuthContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";

function App() {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Function to handle sidebar collapse state changes
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <ChatbotProvider>
      <UserPreferencesProvider>
        <div className={`min-h-screen ${BACKGROUNDS.main} transition-colors duration-200`}>
          <ErrorBoundary>
            {isAuthenticated && <VoiceCommandHandler />}
            <GlobalTutor />
            
            <div className="flex w-full h-screen overflow-hidden">
              {/* Sidebar - dynamic width based on collapse state */}
              <aside 
                className={`h-full flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto transition-all duration-500 ease-out`}
                style={{ 
                  width: sidebarCollapsed ? '70px' : (isMobile ? '100%' : '280px'),
                  transition: 'width 0.5s cubic-bezier(0.19, 1.0, 0.22, 1.0)'
                }}
              >
                <SideNavigation onCollapse={handleSidebarCollapse} isMobile={isMobile} />
              </aside>
              
              {/* Main content - flexible width */}
              <div
                className={`flex-1 flex flex-col min-h-screen ${BACKGROUNDS.main} overflow-y-auto`}
                style={{
                  transition: 'all 0.5s cubic-bezier(0.19, 1.0, 0.22, 1.0)',
                  minHeight: '100vh'
                }}
              >
                <main className={`flex-1 pt-16 pb-16 ${SPACING.container}`}>
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
                    <Route path="voice-demo" element={
                      <ProtectedRoute>
                        <VoiceDemoPage />
                      </ProtectedRoute>
                    } />
                    <Route path="voice-flashcards" element={
                      <ProtectedRoute>
                        <VoiceFlashcardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="voice-exam" element={
                      <ProtectedRoute>
                        <VoiceExamPage />
                      </ProtectedRoute>
                    } />
                    <Route path="profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="settings" element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="change-password" element={
                      <ProtectedRoute>
                        <ChangePasswordPage />
                      </ProtectedRoute>
                    } />
                    <Route path="voice-settings" element={
                      <ProtectedRoute>
                        <VoiceSettingsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="tutor" element={
                      <ProtectedRoute>
                        <TutorPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch-all 404 route */}
                    <Route path="*" element={
                      <div className={`text-center ${SPACING.section} ${BACKGROUNDS.card} ${BORDERS.rounded} mx-auto max-w-lg mt-10`}>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-300">The page you're looking for doesn't exist.</p>
                      </div>
                    } />
                  </Routes>
                </main>
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </UserPreferencesProvider>
    </ChatbotProvider>
  );
}

export default App;
