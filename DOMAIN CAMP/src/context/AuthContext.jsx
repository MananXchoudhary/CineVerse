import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist in local storage on page mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved session, clearing...', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      console.error('Login error', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasPermission = (feature) => {
    if (!user) return false;
    
    // Permission Matrix from Day 02:
    // Feature         | User | Theatre Owner | Admin
    // View Movies     | Yes  | Yes           | Yes
    // Book Tickets    | Yes  | No            | No
    // Manage Shows    | No   | Yes           | Yes
    // Add Movies      | No   | Yes           | Yes
    // Manage Users    | No   | No            | Yes
    // View Reports    | No   | Yes           | Yes
    
    const role = user.role;
    
    switch (feature) {
      case 'VIEW_MOVIES':
        return true; // All roles can view movies
      case 'BOOK_TICKETS':
        return role === 'User';
      case 'MANAGE_SHOWS':
      case 'ADD_MOVIES':
      case 'VIEW_REPORTS':
        return role === 'Theatre Owner' || role === 'Admin';
      case 'MANAGE_USERS':
        return role === 'Admin';
      default:
        return false;
    }
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
