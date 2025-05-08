/**
 * Theme configuration for the Exam Buddy application
 * This file centralizes our theme constants for consistent styling across components
 */

// Primary color palette (blues)
export const PRIMARY = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb', // Primary color
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

// Secondary/accent color palette (ambers)
export const ACCENT = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b', // Accent color
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
};

// Purple accent for gradients and special elements
export const PURPLE = {
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',
};

// Common gradients used throughout the app
export const GRADIENTS = {
  primaryToPurple: 'bg-gradient-to-r from-primary-600 to-purple-600',
  primaryToAccent: 'bg-gradient-to-r from-primary-600 to-accent-500',
  subtlePrimary: 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
  subtleAccent: 'bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20',
};

// Common shadows
export const SHADOWS = {
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
  card: 'shadow-card',
  cardHover: 'shadow-card-hover',
  innerGlow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]',
};

// Common animations and transitions
export const ANIMATIONS = {
  hover: 'transition-all duration-200 ease-in-out',
  scale: 'hover:scale-105 active:scale-95 transition-transform duration-200',
  slideRight: 'hover:translate-x-1 transition-transform duration-200',
  fadeIn: 'animate-fadeIn',
  pulse: 'animate-pulse',
};

// Common border styles
export const BORDERS = {
  light: 'border border-gray-200 dark:border-gray-700',
  subtle: 'border-t border-gray-200 dark:border-gray-700',
  rounded: 'rounded-lg',
  roundedFull: 'rounded-full',
};

// Common spacing
export const SPACING = {
  section: 'py-6 px-4 md:py-8 md:px-6',
  card: 'p-4 md:p-6',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
};

// Common text styles
export const TEXT = {
  title: 'text-2xl md:text-3xl font-bold text-gray-900 dark:text-white',
  subtitle: 'text-xl font-semibold text-gray-800 dark:text-gray-100',
  body: 'text-gray-700 dark:text-gray-300',
  small: 'text-sm text-gray-500 dark:text-gray-400',
  link: 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors',
};

// Common button styles
export const BUTTONS = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 font-medium transition-colors',
  secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2 font-medium transition-colors',
  accent: 'bg-accent-500 hover:bg-accent-600 text-white rounded-lg px-4 py-2 font-medium transition-colors',
  outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg px-4 py-2 font-medium transition-colors',
  icon: 'p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
};

// Common background styles
export const BACKGROUNDS = {
  main: 'bg-white dark:bg-gray-900',
  card: 'bg-white dark:bg-gray-800',
  subtle: 'bg-gray-50 dark:bg-gray-800/50',
  highlight: 'bg-primary-50 dark:bg-primary-900/20',
};
