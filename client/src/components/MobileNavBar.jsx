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
        
        {/* User menu button */}
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="flex flex-col items-center text-xs font-medium px-2 py-1"
          aria-label="Menu"
        >
          <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="mt-0.5 text-gray-500 dark:text-gray-400">Menu</span>
        </button>
      </nav>
      
      {/* Slide-up menu panel */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden animate-fade-in">
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-lg animate-slide-up">
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
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                <select
                  className="input-field py-1 px-2 text-sm w-auto bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200"
                  value={selectedSubject.name}
                  onChange={e => setSelectedSubject(subjects.find(s => s.name === e.target.value))}
                >
                  {subjects.map(s => (
                    <option key={s.name} value={s.name} className="dark:bg-gray-700 dark:text-gray-200">{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                <ThemeToggle />
              </div>
              
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
    </>  
  );
}
