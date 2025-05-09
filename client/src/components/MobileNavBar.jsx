import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSubject } from "../contexts/SubjectContext";
import { navigationItems } from "../config/navigation.jsx";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ui/ThemeToggle";
import { 
  HomeIcon, 
  AcademicCapIcon, 
  ClipboardDocumentCheckIcon, 
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline";

export default function MobileNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  
  // Only access subject context if authenticated
  const subjectContext = isAuthenticated ? useSubject() : { subjects: [], selectedSubject: null, setSelectedSubject: () => {} };
  const { subjects, selectedSubject, setSelectedSubject } = subjectContext;
  
  // Define all possible navigation tabs
  const allTabs = [
    { path: '/', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
    { path: '/practice', label: 'Practice', icon: <AcademicCapIcon className="w-6 h-6" /> },
    { path: '/test', label: 'Test', icon: <ClipboardDocumentCheckIcon className="w-6 h-6" /> },
    { path: '/dashboard', label: 'Stats', icon: <ChartBarIcon className="w-6 h-6" /> },
    { path: '/tutor', label: 'Tutor', icon: <ChatBubbleLeftRightIcon className="w-6 h-6" /> },
    { path: '/calculator', label: 'Calc', icon: <CalculatorIcon className="w-6 h-6" /> }
  ];
  
  // Get current path to determine which tab to replace
  const currentPath = location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`;
  
  // Dynamically create the main tabs, replacing the current page's tab with another important one
  const mainTabs = useMemo(() => {
    // Core tabs that should always be shown if not on their page
    const coreTabs = ['/', '/practice', '/test', '/dashboard'];
    
    // Find the current tab
    const currentTabIndex = allTabs.findIndex(tab => tab.path === currentPath);
    
    // If we're on a core tab page, replace it with the next most important tab
    if (currentTabIndex !== -1 && coreTabs.includes(currentPath)) {
      // Create a new array with all core tabs except the current one
      const availableTabs = allTabs.filter(tab => tab.path !== currentPath);
      
      // Select the first 4 tabs from the available tabs
      return availableTabs.slice(0, 4);
    }
    
    // If we're on a non-core page, show all core tabs
    return allTabs.filter(tab => coreTabs.includes(tab.path));
  }, [currentPath]);
  
  // Define the menu items for the hamburger menu
  const menuItems = [
    { path: '/profile', label: 'Profile', icon: <UserCircleIcon className="w-5 h-5" />, color: 'text-blue-500' },
    { path: '/settings', label: 'Settings', icon: <Cog6ToothIcon className="w-5 h-5" />, color: 'text-gray-500' },
    { path: '/calculator', label: 'Calculator', icon: <CalculatorIcon className="w-5 h-5" />, color: 'text-green-500' },
    { path: '/tutor', label: 'AI Tutor', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, color: 'text-purple-500' },
    { path: '/voice-demo', label: 'Voice Tools', icon: <BeakerIcon className="w-5 h-5" />, color: 'text-orange-500' },
  ];
  
  // Check if a navigation item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Close menu when route changes
  useEffect(() => {
    setShowMenu(false);
    setShowSubjectMenu(false);
  }, [location.pathname]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMenu(false);
  };

  return (
    <>
      {/* Top header for mobile */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md flex items-center justify-between px-4 py-3 z-50 md:hidden border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            <AcademicCapIcon className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-gray-800 dark:text-gray-100 ml-2">ExamBuddy</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Subject selector - only show when authenticated */}
          {isAuthenticated && (
            <button 
              onClick={() => setShowSubjectMenu(!showSubjectMenu)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              aria-label="Select subject"
            >
              <span className="text-xs font-medium truncate max-w-[80px]">{selectedSubject?.name || 'Select Subject'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Hamburger menu button - only show when authenticated */}
          {isAuthenticated ? (
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Menu"
            >
              {showMenu ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          ) : (
            // Login/Register buttons for non-authenticated users
            <div className="flex items-center gap-2">
              {location.pathname !== '/login' && (
                <Link 
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-colors"
                >
                  Login
                </Link>
              )}
              {location.pathname !== '/register' && (
                <Link 
                  to="/register"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-md transition-colors"
                >
                  Register
                </Link>
              )}
            </div>
          )}
        </div>
      </header>
      
      {/* Bottom navigation bar - only show when authenticated */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg flex justify-around py-1.5 z-50 md:hidden border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          {mainTabs.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center text-xs font-medium px-2 py-1.5 transition-colors ${isActive(item.path) 
                ? "text-primary-600 dark:text-primary-400" 
                : "text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-300"}`}
              aria-label={item.label}
            >
              <div className={`p-1.5 rounded-full ${isActive(item.path) ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}>
                {React.cloneElement(item.icon, { 
                  className: `w-5 h-5 ${isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}` 
                })}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
      
      {/* Full-screen menu overlay - only show when authenticated */}
      {isAuthenticated && showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden animate-fade-in">
          <div className="absolute top-16 left-0 right-0 bottom-16 bg-white dark:bg-gray-800 overflow-y-auto">
            {/* User profile section */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.name || 'User'}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.email || ''}</p>
                </div>
              </div>
            </div>
            
            {/* Tiled menu items */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">MENU</h3>
              <div className="grid grid-cols-3 gap-3">
                {menuItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <div className={`p-2 rounded-full ${item.color} bg-opacity-10 dark:bg-opacity-20 mb-2`}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{item.label}</span>
                  </Link>
                ))}
                
                {/* Logout button styled as a menu item */}
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                >
                  <div className="p-2 rounded-full text-red-500 bg-red-100 dark:bg-red-900/20 mb-2">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 text-center">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Subject selection dropdown - only show when authenticated */}
      {isAuthenticated && showSubjectMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden animate-fade-in" onClick={() => setShowSubjectMenu(false)}>
          <div className="absolute top-16 right-0 left-0 bg-white dark:bg-gray-800 shadow-lg py-1 z-50 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="font-medium text-gray-800 dark:text-gray-200">Select Subject</p>
              <button 
                onClick={() => setShowSubjectMenu(false)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              <div className="grid grid-cols-2 gap-2">
                {subjects.map(subject => (
                  <button
                    key={subject.name}
                    className={`p-3 rounded-lg text-left ${selectedSubject?.name === subject.name 
                      ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 border' 
                      : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'}`}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setShowSubjectMenu(false);
                    }}
                  >
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{subject.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subject.groups.length} groups</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
