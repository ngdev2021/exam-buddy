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
    <form onSubmit={handleSubmit(onSubmit)} className={`${BACKGROUNDS.card} ${BORDERS.rounded} ${SHADOWS.lg} p-8 w-full max-w-md`}>
      <h2 className={`${TEXT.title} text-primary-600 dark:text-primary-400 mb-6 text-center`}>Login</h2>
      
      {/* Show form-level errors */}
      {errors.root && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
          {errors.root.message}
        </div>
      )}
      
      {/* Email field */}
      <div className="mb-4">
        <label className={`block ${TEXT.small} mb-1 font-medium text-gray-700 dark:text-gray-300`}>Email</label>
        <input
          type="email"
          className={`w-full ${BORDERS.light} ${errors.email ? 'border-red-500 dark:border-red-400' : 'focus:border-primary-500 dark:focus:border-primary-400'} p-3 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 ${ANIMATIONS.hover}`}
          placeholder="Enter your email"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />
        {errors.email && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      
      {/* Password field */}
      <div className="mb-6">
        <label className={`block ${TEXT.small} mb-1 font-medium text-gray-700 dark:text-gray-300`}>Password</label>
        <input
          type="password"
          className={`w-full ${BORDERS.light} ${errors.password ? 'border-red-500 dark:border-red-400' : 'focus:border-primary-500 dark:focus:border-primary-400'} p-3 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 ${ANIMATIONS.hover}`}
          placeholder="Enter your password"
          {...register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        {errors.password && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      
      {/* Submit button */}
      <button 
        type="submit" 
        className={`w-full ${BUTTONS.primary} py-3 rounded-lg font-medium text-white ${SHADOWS.md} ${ANIMATIONS.scale} disabled:opacity-50 disabled:pointer-events-none`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
      
      {/* Register link */}
      <div className={`mt-6 ${TEXT.small} text-center`}>
        Don't have an account? <Link to="/register" className={`${TEXT.link} font-medium ml-1`}>Register</Link>
      </div>
    </form>
  );
}
