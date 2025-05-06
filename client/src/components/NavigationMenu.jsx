import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSubject } from "../contexts/SubjectContext";
import { navigationItems } from "../config/navigation.jsx";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ui/ThemeToggle";

export default function NavigationMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { subjects, selectedSubject, setSelectedSubject } = useSubject();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  // Check if a navigation item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="w-full bg-white dark:bg-gray-800 shadow sticky top-0 z-50 mb-6 md:flex hidden transition-colors duration-200">
      <div className="container-layout flex justify-between items-center h-16">
        <div className="flex items-center">
          <span className="font-bold text-xl text-primary-600 dark:text-primary-400 tracking-wide mr-8">ExamBuddy</span>
          <ul className="flex gap-2">
            {navigationItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`py-2 px-4 rounded-md transition font-medium ${isActive(item.path) 
                    ? "bg-primary-600 text-white dark:bg-primary-700" 
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              className="input-field py-1.5 px-3 pr-8 text-sm rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
              value={selectedSubject.name}
              onChange={e => {
                const subj = subjects.find(s => s.name === e.target.value);
                setSelectedSubject(subj);
              }}
              aria-label="Select subject"
            >
              {subjects.map(s => (
                <option key={s.name} value={s.name} className="dark:bg-gray-700 dark:text-gray-200">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          
          <ThemeToggle />
          
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-full bg-gray-200 dark:bg-gray-700 p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 transition-colors duration-200">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium">{user?.name || 'User'}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{user?.email || ''}</p>
                </div>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  Your Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
