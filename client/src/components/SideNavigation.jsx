import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSubject } from "../contexts/SubjectContext";
import { navigationItems } from "../config/navigation.jsx";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ui/ThemeToggle";
import { 
  XMarkIcon, 
  Bars3Icon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

export default function SideNavigation({ onCollapse, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { subjects, selectedSubject, setSelectedSubject } = useSubject();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('main');
  const [hoverItem, setHoverItem] = useState(null);
  
  // Notify parent component when collapse state changes
  useEffect(() => {
    if (onCollapse) {
      onCollapse(isCollapsed);
    }
  }, [isCollapsed, onCollapse]);
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [location.pathname]);
  
  // Handle navigation click - simplified to work with React Router
  const handleNavClick = () => {
    // Just close the mobile sidebar after navigation
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (sidebar && !sidebar.contains(event.target) && 
          toggleButton && !toggleButton.contains(event.target) && 
          isOpen && window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    
    // Close mobile sidebar after logout
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Check if a navigation item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Group navigation items by category
  const navGroups = {
    main: navigationItems.filter(item => ['/', '/practice', '/test', '/dashboard'].includes(item.path)),
    tools: navigationItems.filter(item => ['/calculator', '/tutor'].includes(item.path)),
    voice: navigationItems.filter(item => ['/voice-demo', '/voice-flashcards', '/voice-exam'].includes(item.path))
  };
  
  return (
    <>
      {/* Toggle button for mobile */}
      <button 
        id="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-gray-800 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700 transition-transform duration-200 hover:scale-110 active:scale-90"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <div
          className="transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          )}
        </div>
      </button>
      
      {/* Sidebar */}
      <div
        id="sidebar"
        className={`h-full bg-white dark:bg-gray-800 overflow-y-auto relative transition-all duration-500 ease-out ${isCollapsed ? 'w-[70px]' : 'w-full'}`}
      >
        {/* Removed floating button - moved to header */}
        
        <div className="flex flex-col h-full w-full">
          {/* Header with premium gradient */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between p-4'} bg-gradient-to-r from-primary-600 to-purple-600 text-white`}>
            <div className="flex items-center">
              <SparklesIcon className={`w-6 h-6 ${isCollapsed ? '' : 'mr-2'}`} />
              {!isCollapsed ? (
                <span className="font-bold text-lg tracking-wide">ExamBuddy</span>
              ) : null}
            </div>
            
            <div className="flex items-center space-x-2">
              {!isCollapsed ? (
                <ThemeToggle className="text-white" />
              ) : null}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <div 
                  className="transition-all duration-300 flex items-center justify-center"
                  style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
                >
                  <ChevronLeftIcon className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4">
            <div className="space-y-6">
              {/* Main navigation */}
              <div>
                <h3 className={`${isCollapsed ? 'sr-only' : 'px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'}`}>
                  Main
                </h3>
                <ul className="mt-2 space-y-1">
                  {navGroups.main.map(item => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={handleNavClick}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive(item.path) 
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onMouseEnter={() => setHoverItem(item.path)}
                        onMouseLeave={() => setHoverItem(null)}
                      >
                        <span className={`transition-all duration-300 ${isCollapsed ? 'mr-0' : 'mr-3'}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed ? (
                          <span className="font-medium text-sm">{item.label}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Tools navigation */}
              <div>
                <h3 className={`${isCollapsed ? 'sr-only' : 'px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'}`}>
                  Tools
                </h3>
                <ul className="mt-2 space-y-1">
                  {navGroups.tools.map(item => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={handleNavClick}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive(item.path) 
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onMouseEnter={() => setHoverItem(item.path)}
                        onMouseLeave={() => setHoverItem(null)}
                      >
                        <span className={`transition-all duration-300 ${isCollapsed ? 'mr-0' : 'mr-3'}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed ? (
                          <span className="font-medium text-sm">{item.label}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Voice navigation */}
              <div>
                <h3 className={`${isCollapsed ? 'sr-only' : 'px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'}`}>
                  Voice
                </h3>
                <ul className="mt-2 space-y-1">
                  {navGroups.voice.map(item => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={handleNavClick}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive(item.path) 
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onMouseEnter={() => setHoverItem(item.path)}
                        onMouseLeave={() => setHoverItem(null)}
                      >
                        <span className={`transition-all duration-300 ${isCollapsed ? 'mr-0' : 'mr-3'}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed ? (
                          <span className="font-medium text-sm">{item.label}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
          
          {/* Footer with user actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto bg-gray-50 dark:bg-gray-800/50">
            <ul className="space-y-1">
              <li className="transition-all duration-200 hover:translate-x-1 active:scale-95">
                <Link
                  to="/profile"
                  onClick={handleNavClick}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <UserCircleIcon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} text-primary-500 dark:text-primary-400`} />
                  {!isCollapsed ? (
                    <span className="font-medium text-sm">Your Profile</span>
                  ) : null}
                </Link>
              </li>
              <li className="transition-all duration-200 hover:translate-x-1 active:scale-95">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-left"
                >
                  <ArrowRightOnRectangleIcon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} text-red-500 dark:text-red-400`} />
                  {!isCollapsed ? (
                    <span className="font-medium text-sm">Sign out</span>
                  ) : null}
                </button>
              </li>
            </ul>
            
            {/* Copyright notice */}
            {!isCollapsed ? (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  © {new Date().getFullYear()} ExamBuddy
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Tooltip for collapsed sidebar items */}
      {isCollapsed && hoverItem ? (
        <div
          className="fixed z-50 px-3 py-2 text-sm font-medium text-white pointer-events-none"
          style={{
            left: '80px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-purple-600) 100%)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="relative">
            {/* Arrow pointing to the menu item */}
            <div 
              className="absolute -left-5 top-1/2 transform -translate-y-1/2" 
              style={{
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '6px solid var(--color-primary-600)'
              }}
            />
            <div className="flex items-center space-x-1">
              {/* Safe rendering of tooltip content */}
              {(() => {
                // Find the navigation item and cache it to avoid undefined issues
                const navItem = navigationItems.find(item => item.path === hoverItem) || {};
                return (
                  <>
                    {navItem.icon ? (
                      <span className="opacity-75">
                        {navItem.icon}
                      </span>
                    ) : null}
                    <span>{navItem.label || 'Menu Item'}</span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
