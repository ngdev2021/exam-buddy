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

export default function SideNavigation({ onCollapse, isMobile, isOpen, toggleSidebar, isCollapsed: propIsCollapsed }) {
  console.log('SideNavigation props:', { isMobile, isOpen, propIsCollapsed });
  const location = useLocation();
  const navigate = useNavigate();
  const { subjects, selectedSubject, setSelectedSubject } = useSubject();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(propIsCollapsed || false);
  const [activeSection, setActiveSection] = useState('main');
  const [hoverItem, setHoverItem] = useState(null);
  
  // Sync with parent component's collapsed state
  useEffect(() => {
    if (propIsCollapsed !== undefined) {
      setIsCollapsed(propIsCollapsed);
      console.log('SideNavigation updated isCollapsed:', propIsCollapsed);
    }
  }, [propIsCollapsed]);
  
  // Notify parent component when collapse state changes
  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapse) {
      onCollapse(newCollapsedState);
    }
  };
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && toggleSidebar && isOpen) {
      toggleSidebar();
    }
  }, [location.pathname, isMobile, toggleSidebar, isOpen]);
  
  // Function to close sidebar on mobile
  const handleNavClick = () => {
    if (isMobile && toggleSidebar && isOpen) {
      toggleSidebar();
    }
  };
  
  // Handle logout - this is the only place we use navigate() directly
  const handleLogout = () => {
    logout();
    navigate('/login');
    
    // Close mobile sidebar after logout
    if (isMobile && toggleSidebar && isOpen) {
      toggleSidebar();
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
      {/* Sidebar */}
      <div
        id="sidebar"
        className={`h-full bg-white dark:bg-gray-800 overflow-y-auto relative transition-all duration-500 ease-out border-r border-gray-200 dark:border-gray-700 ${isCollapsed ? 'w-[70px]' : 'w-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Logo and collapse button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
            <Link to="/" className="flex items-center space-x-3" onClick={handleNavClick}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                <AcademicCapIcon className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">ExamBuddy</span>
              )}
            </Link>
            
            {/* Only show collapse button on desktop */}
            {!isMobile && (
              <button
                onClick={handleCollapseToggle}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="w-5 h-5" />
                ) : (
                  <ChevronLeftIcon className="w-5 h-5" />
                )}
              </button>
            )}
            
            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
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
