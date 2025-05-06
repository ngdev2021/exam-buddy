import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setError,
    watch
  } = useForm();
  
  const password = watch('password', '');
  
  const onSubmit = async (data) => {
    try {
      await registerUser(data.email, data.password);
      // Navigate to home after successful registration
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError('root', { 
        type: 'manual',
        message: err.message || 'Registration failed. Please try again.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Create Account</h2>
      
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
      <div className="mb-3">
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
      
      {/* Confirm Password field */}
      <div className="mb-4">
        <input
          type="password"
          className={`w-full border p-2 rounded ${errors.confirmPassword ? 'border-red-500' : ''}`}
          placeholder="Confirm Password"
          {...register('confirmPassword', { 
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      {/* Submit button */}
      <button 
        type="submit" 
        className="w-full bg-green-600 text-white rounded p-2 font-bold hover:bg-green-700 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Account...' : 'Register'}
      </button>
      
      {/* Login link */}
      <div className="mt-4 text-sm text-center">
        Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
      </div>
    </form>
  );
}
