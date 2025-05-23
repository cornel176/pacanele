import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/me', {
        withCredentials: true
      });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/login',
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { error: 'A apărut o eroare la autentificare' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/register',
        { username, email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error.response?.data || { error: 'A apărut o eroare la înregistrare' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 