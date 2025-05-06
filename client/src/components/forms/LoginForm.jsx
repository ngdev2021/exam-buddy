import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Login</h2>
      
      {/* Show form-level errors */}
      {errors.root && (
        <div className="text-red-500 mb-2">{errors.root.message}</div>
      )}
      
      {/* Email field */}
      <div className="mb-3">
        <input
          type="email"
          className={`w-full border p-2 rounded ${errors.email ? 'border-red-500' : ''}`}
          placeholder="Email"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      
      {/* Password field */}
      <div className="mb-4">
        <input
          type="password"
          className={`w-full border p-2 rounded ${errors.password ? 'border-red-500' : ''}`}
          placeholder="Password"
          {...register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      
      {/* Submit button */}
      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white rounded p-2 font-bold hover:bg-blue-700 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
      
      {/* Register link */}
      <div className="mt-4 text-sm text-center">
        Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
      </div>
    </form>
  );
}
