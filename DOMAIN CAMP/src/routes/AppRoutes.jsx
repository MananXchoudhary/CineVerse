import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Login } from '../pages/Auth/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { MovieCatalog } from '../pages/MovieCatalog/MovieCatalog';
import { Booking } from '../pages/Booking/Booking';

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />

      {/* Protected Routes - All Authenticated Roles */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/catalog" 
        element={
          <ProtectedRoute allowedFeature="VIEW_MOVIES">
            <MovieCatalog />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes - Role-Specific (User only) */}
      <Route 
        path="/booking/:id" 
        element={
          <ProtectedRoute allowedFeature="BOOK_TICKETS">
            <Booking />
          </ProtectedRoute>
        } 
      />

      {/* Fallback routing */}
      <Route 
        path="*" 
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
