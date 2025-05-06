import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSubject } from "../contexts/SubjectContext";
import { navigationItems } from "../config/navigation.jsx";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ui/ThemeToggle";

export default function MobileNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { subjects, selectedSubject, setSelectedSubject } = useSubject();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  
  // Check if a navigation item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMenu(false);
  };

  return (
    <>
      {/* Top header for mobile */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md flex items-center justify-between px-4 py-2 z-50 md:hidden border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center">
          <span className="font-bold text-lg text-primary-600 dark:text-primary-400">ExamBuddy</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Subject selector */}
          <button 
            onClick={() => setShowSubjectMenu(!showSubjectMenu)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
            aria-label="Select subject"
          >
            <span className="text-xs font-medium truncate max-w-[80px]">{selectedSubject.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* User profile button */}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>
        </div>
      </header>
      
      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg flex justify-around py-2 z-50 md:hidden border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        {navigationItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center text-xs font-medium px-2 py-1 transition-colors ${isActive(item.path) 
              ? "text-primary-600 dark:text-primary-400" 
              : "text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-300"}`}
            aria-label={item.label}
          >
            {item.icon}
            <span className="mt-0.5">{item.label}</span>
            {isActive(item.path) && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mt-1"></div>
            )}
          </Link>
        ))}
      </nav>
      
      {/* Slide-up menu panel */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden animate-fade-in">
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-lg animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{user?.name || 'User'}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.email || ''}</p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <Link 
                to="/profile" 
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-sm">Your Profile</span>
              </Link>
              
              <Link 
                to="/settings" 
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-sm">Settings</span>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="flex items-center w-full p-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <span className="text-sm">Sign out</span>
              </button>
            </div>
            
            <div className="p-4">
              <button 
                onClick={() => setShowMenu(false)}
                className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Subject selection dropdown */}
      {showSubjectMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden animate-fade-in" onClick={() => setShowSubjectMenu(false)}>
          <div className="absolute top-14 right-4 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 transition-colors duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Subject</p>
            </div>
            {subjects.map(subject => (
              <button
                key={subject.name}
                className={`w-full text-left px-3 py-2 text-sm ${selectedSubject.name === subject.name 
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => {
                  setSelectedSubject(subject);
                  setShowSubjectMenu(false);
                }}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>  
  );
}
