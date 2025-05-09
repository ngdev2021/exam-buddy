import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaCog, FaBell, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { TEXT, BACKGROUNDS } from '../styles/theme';

const DesktopHeader = ({ sidebarWidth = '240px' }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 fixed top-0 right-0 z-40 transition-all duration-500 ease-out" style={{ left: sidebarWidth }}>
      <div className="h-full flex items-center justify-between px-6">
        {/* Left side - Brand/Logo for desktop */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Exam Buddy</h1>
        </div>
        
        {/* Right side - User controls */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-48 lg:w-64"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Notification bell */}
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative">
            <FaBell className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Settings */}
          <Link to="/settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FaCog className="text-gray-600 dark:text-gray-300" />
          </Link>
          
          {/* User profile */}
          <Link to="/profile" className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
              ) : (
                <FaUser className="text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200 hidden lg:inline-block">
              {user?.displayName || 'User'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
