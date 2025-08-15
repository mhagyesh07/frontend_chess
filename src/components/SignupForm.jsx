import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SignupForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, loading, error, clearError } = useAuth();

  useEffect(() => {
    // Clear auth error when component mounts or form data changes
    if (error) {
      clearError();
    }
  }, [formData, clearError, error]);

  const validateForm = () => {
    const errors = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      errors.username = 'Username must be between 3 and 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear confirm password error if passwords now match
    if (name === 'password' && formErrors.confirmPassword && value === formData.confirmPassword) {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: '',
      }));
    }
    if (name === 'confirmPassword' && formErrors.confirmPassword && value === formData.password) {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData.username, formData.password);
      // Redirect to dashboard on successful registration
      window.location.href = '/dashboard';
    } catch (error) {
      // Log specific validation errors from the backend
      console.error('Registration failed:', error.message);
      if (error.response && error.response.data && error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }

      // Handle specific error for username already exists
      if (error.message === 'Username already exists') {
        setFormErrors((prev) => ({
          ...prev,
          username: 'This username is already taken. Please choose another one.',
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display auth error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
            formErrors.username ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Choose a username"
          disabled={loading || isSubmitting}
        />
        {formErrors.username && (
          <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
            formErrors.password ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Create a password"
          disabled={loading || isSubmitting}
        />
        {formErrors.password && (
          <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
            formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Confirm your password"
          disabled={loading || isSubmitting}
        />
        {formErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || isSubmitting}
        className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading || isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>

      {/* Switch to Login */}
      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-yellow-600 hover:text-yellow-700 font-medium"
          disabled={loading || isSubmitting}
        >
          Sign in here
        </button>
      </div>
    </form>
  );
};

export default SignupForm;