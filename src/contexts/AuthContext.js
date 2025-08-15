import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let initialized = false;

    const initializeAuth = () => {
      if (initialized) return;
      initialized = true;

      try {
        const token = localStorage.getItem('token');
        console.log('Token during initialization:', token);
        if (token) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout(); // Clear invalid token
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(username, password);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);

      console.log('Token stored in localStorage:', localStorage.getItem('token'));

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(username, password);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);

      console.log('Token stored in localStorage:', localStorage.getItem('token'));

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated,
  };

  console.log('AuthContext initialized. isAuthenticated:', isAuthenticated);
  console.log('Current user:', user);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};