import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaCog, FaBell, FaSearch, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSubject } from '../contexts/SubjectContext';
import { TEXT, BACKGROUNDS } from '../styles/theme';

const DesktopHeader = () => {
  console.log('DesktopHeader rendering');
  const { user } = useAuth();
  const { subjects, selectedSubject, setSelectedSubject } = useSubject();
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  const subjectMenuRef = useRef(null);
  
  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (subjectMenuRef.current && !subjectMenuRef.current.contains(event.target)) {
        setSubjectMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 w-full z-40 transition-all duration-500 ease-out sticky top-0 left-0 right-0">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left side - Brand/Logo and Subject Selector for desktop */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Exam Buddy</h1>
          
          {/* Subject Selector */}
          <div className="relative" ref={subjectMenuRef}>
            <button 
              onClick={() => setSubjectMenuOpen(!subjectMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {selectedSubject?.name || 'Select Subject'}
              </span>
              <FaChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${subjectMenuOpen ? 'transform rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {subjectMenuOpen && (
              <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {subjects.map((subject) => (
                    <button
                      key={subject.name}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setSubjectMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${selectedSubject?.name === subject.name ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
