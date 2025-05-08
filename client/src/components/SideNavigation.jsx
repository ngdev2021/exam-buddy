import React, { useState, useEffect, useRef } from "react";
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
import { motion, AnimatePresence } from 'framer-motion';

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
  };

  // Check if a navigation item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Animation variants for framer-motion
  const sidebarVariants = {
    expanded: { width: '280px', transition: { duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] } },
    collapsed: { width: '70px', transition: { duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] } }
  };
  
  const itemVariants = {
    expanded: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut', delay: 0.1 } },
    collapsed: { opacity: 0, x: -10, transition: { duration: 0.2, ease: 'easeIn' } }
  };
  
  const iconVariants = {
    expanded: { marginRight: '12px', transition: { duration: 0.3 } },
    collapsed: { marginRight: '0', transition: { duration: 0.3 } }
  };
  
  const containerVariants = {
    expanded: { width: '100%', transition: { duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] } },
    collapsed: { width: '70px', transition: { duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] } }
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
      <motion.button 
        id="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-gray-800 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          )}
        </motion.div>
      </motion.button>
      
      {/* Brand logo for mobile */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 md:hidden">
        <motion.span 
          className="font-bold text-xl text-primary-600 dark:text-primary-400 tracking-wide flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SparklesIcon className="w-5 h-5 mr-1" />
          ExamBuddy
        </motion.span>
      </div>
      
      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      
      {/* Desktop collapse toggle button */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-1/2 transform -translate-y-1/2 z-40 hidden md:flex items-center justify-center w-6 h-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-md shadow-md focus:outline-none"
        style={{
          left: isCollapsed ? '58px' : '278px',
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        whileHover={{ 
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          backgroundColor: "var(--color-primary-50)"
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeftIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </motion.div>
      </motion.button>
      
      {/* Sidebar */}
      <motion.div
        id="sidebar"
        className="h-full bg-white dark:bg-gray-800 overflow-y-auto relative"
        variants={containerVariants}
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
      >
        {/* God-tier collapse/expand button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 transform -translate-y-1/2 -right-3 z-40 flex items-center justify-center w-6 h-24 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 border border-primary-400 dark:border-primary-500 rounded-r-md shadow-lg focus:outline-none"
          whileHover={{
            scale: 1.05,
            boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            boxShadow: ['0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
                       '0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 10px 15px -5px rgba(0, 0, 0, 0.08)',
                       '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'],
            transition: {
              boxShadow: {
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 2,
              }
            }
          }}
          exit={{ opacity: 0 }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="bg-white dark:bg-gray-800 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
          >
            <ChevronLeftIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
          </motion.div>
        </motion.button>
        <div className="flex flex-col h-full w-full">
          {/* Header with premium gradient */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between p-4'} bg-gradient-to-r from-primary-600 to-purple-600 text-white`}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SparklesIcon className="w-5 h-5 mr-2 text-yellow-300" />
                  <span className="font-bold text-xl tracking-wide">
                    ExamBuddy
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <ThemeToggle />
          </div>
          
          {/* User profile with premium styling */}
          <div className={`${isCollapsed ? 'p-2 flex justify-center' : 'p-4'} border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-primary-600/10 to-transparent`}>
            {isCollapsed ? (
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-medium ring-2 ring-white dark:ring-gray-800 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </motion.div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-medium ring-2 ring-white dark:ring-gray-800 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Subject selector with enhanced styling */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                className="p-4 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <AcademicCapIcon className="w-4 h-4 mr-2 text-primary-500" />
                  Subject
                </label>
                <select
                  className="w-full py-2 px-3 text-sm rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                  value={selectedSubject.name}
                  onChange={(e) => {
                    const subj = subjects.find(s => s.name === e.target.value);
                    setSelectedSubject(subj);
                  }}
                  aria-label="Select subject"
                >
                  {subjects.map(s => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Navigation sections */}
          <nav className={`flex-1 ${isCollapsed ? 'py-4 px-2' : 'p-4'} overflow-y-auto`}>
            {/* Main navigation group */}
            <div className="mb-6">
              {!isCollapsed && (
                <motion.h3 
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2"
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                >
                  Main
                </motion.h3>
              )}
              <ul className="space-y-1">
                {navGroups.main.map(item => (
                  <motion.li key={item.path}
                    whileHover={{ x: isCollapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : ''} ${isCollapsed ? 'p-2' : 'px-3 py-2'} rounded-lg transition-all duration-200 ${isActive(item.path)
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                      title={isCollapsed ? item.label : ''}
                      onMouseEnter={() => setHoverItem(item.path)}
                      onMouseLeave={() => setHoverItem(null)}
                    >
                      <motion.div
                        variants={iconVariants}
                        animate={isCollapsed ? 'collapsed' : 'expanded'}
                        className={`${isActive(item.path) ? 'text-white' : 'text-primary-500 dark:text-primary-400'} ${isCollapsed ? '' : 'mr-3'}`}
                      >
                        {item.icon}
                      </motion.div>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span 
                            className="font-medium"
                            variants={itemVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {/* Tools navigation group */}
            <div className="mb-6">
              {!isCollapsed && (
                <motion.h3 
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2"
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                >
                  Tools
                </motion.h3>
              )}
              <ul className="space-y-1">
                {navGroups.tools.map(item => (
                  <motion.li key={item.path}
                    whileHover={{ x: isCollapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : ''} ${isCollapsed ? 'p-2' : 'px-3 py-2'} rounded-lg transition-all duration-200 ${isActive(item.path)
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                      title={isCollapsed ? item.label : ''}
                      onMouseEnter={() => setHoverItem(item.path)}
                      onMouseLeave={() => setHoverItem(null)}
                    >
                      <motion.div
                        variants={iconVariants}
                        animate={isCollapsed ? 'collapsed' : 'expanded'}
                        className={`${isActive(item.path) ? 'text-white' : 'text-primary-500 dark:text-primary-400'} ${isCollapsed ? '' : 'mr-3'}`}
                      >
                        {item.icon}
                      </motion.div>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span 
                            className="font-medium"
                            variants={itemVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {/* Voice navigation group */}
            <div className="mb-6">
              {!isCollapsed && (
                <motion.h3 
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2"
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                >
                  Voice Features
                </motion.h3>
              )}
              <ul className="space-y-1">
                {navGroups.voice.map(item => (
                  <motion.li key={item.path}
                    whileHover={{ x: isCollapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : ''} ${isCollapsed ? 'p-2' : 'px-3 py-2'} rounded-lg transition-all duration-200 ${isActive(item.path)
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                      title={isCollapsed ? item.label : ''}
                      onMouseEnter={() => setHoverItem(item.path)}
                      onMouseLeave={() => setHoverItem(null)}
                    >
                      <motion.div
                        variants={iconVariants}
                        animate={isCollapsed ? 'collapsed' : 'expanded'}
                        className={`${isActive(item.path) ? 'text-white' : 'text-primary-500 dark:text-primary-400'} ${isCollapsed ? '' : 'mr-3'}`}
                      >
                        {item.icon}
                      </motion.div>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span 
                            className="font-medium"
                            variants={itemVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </nav>
          
          {/* Footer with user actions */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto bg-gray-50 dark:bg-gray-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <ul className="space-y-1">
                  <motion.li whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      <UserCircleIcon className="w-5 h-5 mr-3 text-primary-500 dark:text-primary-400" />
                      <span className="font-medium text-sm">Your Profile</span>
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="hidden absolute top-4 right-4 p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                      {isCollapsed ? (
                        <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      ) : (
                        <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      )}
                    </button>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-left"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-red-500 dark:text-red-400" />
                      <span className="font-medium text-sm">Sign out</span>
                    </button>
                  </motion.li>
                </ul>
                
                {/* Copyright notice */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} ExamBuddy
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Premium tooltip for collapsed sidebar items */}
      <AnimatePresence>
        {isCollapsed && hoverItem && (
          <motion.div
            className="fixed z-50 px-3 py-2 text-sm font-medium text-white pointer-events-none"
            style={{
              left: '80px',
              top: `${document.querySelector(`a[href='${hoverItem}']`)?.getBoundingClientRect().top}px`,
              translateY: '-50%',
              background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-purple-600) 100%)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            transition={{ 
              type: 'spring',
              stiffness: 500,
              damping: 30
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
                {navigationItems.find(item => item.path === hoverItem)?.icon && (
                  <span className="opacity-75">
                    {navigationItems.find(item => item.path === hoverItem)?.icon}
                  </span>
                )}
                <span>{navigationItems.find(item => item.path === hoverItem)?.label}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
