import React from 'react';

/**
 * A reusable loading spinner component with different sizes and optional text
 */
export default function LoadingSpinner({ size = 'medium', text, fullPage = false }) {
  // Size classes
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };
  
  // Container classes based on whether it's full page or not
  const containerClasses = fullPage 
    ? 'flex flex-col items-center justify-center min-h-[80vh]' 
    : 'flex flex-col items-center py-4';
  
  return (
    <div className={containerClasses}>
      <div 
        className={`${sizeClasses[size]} rounded-full border-blue-600 border-t-transparent animate-spin`} 
        role="status" 
        aria-label="Loading"
      />
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
}
