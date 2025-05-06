import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error information for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // You could also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }
  
  handleReload = () => {
    window.location.reload();
  };
  
  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Get a user-friendly error message
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="w-full max-w-md bg-white border border-red-200 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-red-600 font-medium mb-2">{errorMessage}</p>
              <p className="text-gray-600 text-sm">We apologize for the inconvenience. You can try the following options:</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={this.handleReload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Reload Page
              </button>
              <button 
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
              >
                Go to Home
              </button>
            </div>
            
            {this.props.onReset && (
              <button 
                onClick={this.props.onReset}
                className="w-full mt-3 border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded transition-colors"
              >
                Reset and Try Again
              </button>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
              If this problem persists, please contact support at support@exambuddy.com
            </div>
          </div>
        </div>
      );
    }
    
    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
