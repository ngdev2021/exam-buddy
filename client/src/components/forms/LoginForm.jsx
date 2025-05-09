import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BACKGROUNDS, BORDERS, BUTTONS, SHADOWS, TEXT, ANIMATIONS } from '../../styles/theme';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setError
  } = useForm();
  
  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      // Navigate to the page the user was trying to access, or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('root', { 
        type: 'manual',
        message: err.message || 'Login failed. Please check your credentials and try again.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <h2 className={`${TEXT.title} text-gray-800 dark:text-gray-100 mb-6 text-center text-xl sm:text-2xl font-bold`}>Welcome Back</h2>
      
      {/* Show form-level errors */}
      {errors.root && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm animate-fadeIn">
          {errors.root.message}
        </div>
      )}
      
      {/* Email field */}
      <div className="mb-5">
        <label className={`block ${TEXT.small} mb-2 font-medium text-gray-700 dark:text-gray-300`}>Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
          </div>
          <input
            type="email"
            className={`w-full pl-10 ${BORDERS.light} ${errors.email ? 'border-red-500 dark:border-red-400' : 'focus:border-primary-500 dark:focus:border-primary-400'} p-3 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 ${ANIMATIONS.hover} text-base`}
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            {errors.email.message}
          </p>
        )}
      </div>
      
      {/* Password field */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className={`block ${TEXT.small} font-medium text-gray-700 dark:text-gray-300`}>Password</label>
          <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <input
            type="password"
            className={`w-full pl-10 ${BORDERS.light} ${errors.password ? 'border-red-500 dark:border-red-400' : 'focus:border-primary-500 dark:focus:border-primary-400'} p-3 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 ${ANIMATIONS.hover} text-base`}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
        </div>
        {errors.password && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            {errors.password.message}
          </p>
        )}
      </div>
      
      {/* Submit button */}
      <button 
        type="submit" 
        className={`w-full ${BUTTONS.primary} py-3.5 rounded-lg font-medium text-white ${SHADOWS.md} ${ANIMATIONS.scale} disabled:opacity-50 disabled:pointer-events-none text-base relative overflow-hidden transition-all duration-300`}
        disabled={isSubmitting}
      >
        <span className={`${isSubmitting ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
          Sign In
        </span>
        {isSubmitting && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
      </button>
      
      {/* Register link */}
      <div className={`mt-6 text-sm text-center text-gray-600 dark:text-gray-400`}>
        Don't have an account? <Link to="/register" className={`${TEXT.link} font-medium ml-1 text-primary-600 dark:text-primary-400 hover:underline`}>Create account</Link>
      </div>
    </form>
  );
}
