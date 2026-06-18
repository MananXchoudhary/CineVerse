import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('jwtToken', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid username or password');
      } else if (err.response) {
        setError(err.response.data.message || 'Login failed');
      } else {
        setError('Network Error. Is the backend running?');
      }
    }
  };

  return (
    <div className="container">
      <h1>Sign In</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={username} onChange={v => setUsername(v.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={v => setPassword(v.target.value)} required />
        </div>
        <button type="submit" className="btn">Login</button>
      </form>
    </div>
  );
}
