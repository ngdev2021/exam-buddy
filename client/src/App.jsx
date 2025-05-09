import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { BACKGROUNDS, SPACING, BORDERS, TEXT } from "./styles/theme";
import SideNavigation from "./components/SideNavigation";
import DesktopHeader from "./components/DesktopHeader";
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
import LessonsPage from "./pages/LessonsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import MobileNavBar from "./components/MobileNavBar"; // Import MobileNavBar
import { useAuth } from "./context/AuthContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";

function App() {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Function to handle sidebar collapse state changes
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
    // Save preference to localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  };

  // Function to toggle sidebar open/closed state on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Handle responsive layout and restore user preferences
  useEffect(() => {
    const handleResize = () => {
      // Desktop is >= 992px for better tablet support
      const mobileView = window.innerWidth < 992;
      console.log('Window width:', window.innerWidth, 'Mobile view:', mobileView);
      setIsMobile(mobileView);
      if (mobileView) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
      console.log('After resize - isMobile:', mobileView, 'sidebarOpen:', !mobileView);
    };
    
    // Restore user preference for sidebar collapsed state
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState !== null) {
      setSidebarCollapsed(JSON.stringify(savedCollapsedState) === 'true');
    } else if (window.innerWidth < 1024 && window.innerWidth >= 768) {
      // Default to collapsed on tablets
      setSidebarCollapsed(true);
    }
    
    // Set initial mobile state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Debug log for render
  console.log('Render state - isMobile:', isMobile, 'isAuthenticated:', isAuthenticated, 'sidebarOpen:', sidebarOpen, 'sidebarCollapsed:', sidebarCollapsed);

  return (
    <ChatbotProvider>
      <UserPreferencesProvider>
        <div className={`min-h-screen ${BACKGROUNDS.main} transition-colors duration-200`}>
          <ErrorBoundary>
            {isAuthenticated && <VoiceCommandHandler />}
            <GlobalTutor />
            
            {/* Mobile navigation for all pages when on mobile */}
            {isMobile && <MobileNavBar />}
            {console.log('Should show MobileNavBar?', isMobile)}
            
            {/* Layout structure - different for mobile vs desktop */}
            <div className="flex h-screen w-full overflow-hidden">
              {/* Sidebar - always visible on desktop or when opened on mobile */}
              {isAuthenticated && !isMobile && (
                <div className="h-full" style={{ width: sidebarCollapsed ? '70px' : '240px', flexShrink: 0 }}>
                  <SideNavigation 
                    isMobile={isMobile}
                    isOpen={true}
                    toggleSidebar={toggleSidebar}
                    isCollapsed={sidebarCollapsed}
                    onCollapse={handleSidebarCollapse}
                  />
                </div>
              )}
              
              {/* Mobile sidebar - only visible when opened */}
              {isAuthenticated && isMobile && sidebarOpen && (
                <div className="fixed top-0 left-0 h-full z-50" style={{ width: '240px' }}>
                  <SideNavigation 
                    isMobile={isMobile}
                    isOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    isCollapsed={false}
                    onCollapse={handleSidebarCollapse}
                  />
                </div>
              )}
              
              {/* Mobile overlay */}
              {isMobile && sidebarOpen && isAuthenticated && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                  onClick={toggleSidebar}
                  aria-hidden="true"
                ></div>
              )}
              
              {/* Main content wrapper */}
              <div className="flex flex-col flex-1 h-full overflow-hidden">
                {/* Desktop header - only visible on desktop */}
                {!isMobile && isAuthenticated && (
                  <div className="sticky top-0 z-40">
                    <DesktopHeader />
                  </div>
                )}
                
                {/* Main content area */}
                <main 
                  className="flex-1 overflow-y-auto p-4" 
                  style={{ 
                    paddingBottom: isMobile && isAuthenticated ? '70px' : '16px',
                  }}
                >
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
                    <Route path="lessons" element={
                      <ProtectedRoute>
                        <LessonsPage />
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
