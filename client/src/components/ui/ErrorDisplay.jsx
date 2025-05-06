import React from 'react';

/**
 * A reusable error display component with optional retry functionality
 */
export default function ErrorDisplay({ 
  error, 
  onRetry = null, 
  fullPage = false,
  title = 'Something went wrong'
}) {
  // Container classes based on whether it's full page or not
  const containerClasses = fullPage 
    ? 'flex flex-col items-center justify-center min-h-[80vh] p-6' 
    : 'flex flex-col items-center p-6';
  
  // Get error message from error object or string
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : 'An unexpected error occurred';
  
  return (
    <div className={`${containerClasses} bg-red-50 rounded-lg border border-red-200`}>
      <div className="text-red-600 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-700 mb-2">{title}</h3>
      <p className="text-red-600 mb-4 text-center">{errorMessage}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
