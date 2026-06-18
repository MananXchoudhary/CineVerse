import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import PublicTable from './components/PublicTable';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/public">Public Info</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/public" />} />
        <Route path="/public" element={<PublicTable />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
