import React, { useState } from 'react';
import api from '../api/axiosConfig';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Handle form submission and display response code messaging 
    try {
      const response = await api.post('/auth/register', { username, email, password });
      if (response.status === 200) {
        setSuccess('Registration successful! You can now login.');
      }
    } catch (err) {
      if (err.response) {
        setError('Error: ' + (err.response.data.message || 'Username/Email exists'));
      } else {
        setError('Network Error.');
      }
    }
  };

  return (
    <div className="container">
      <h1>Register</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleRegister}>
        <div className="form-group"><label>Username</label><input type="text" value={username} onChange={v => setUsername(v.target.value)} required /></div>
        <div className="form-group"><label>Email</label><input type="email" value={email} onChange={v => setEmail(v.target.value)} required /></div>
        <div className="form-group"><label>Password</label><input type="password" value={password} onChange={v => setPassword(v.target.value)} required /></div>
        <button type="submit" className="btn">Register</button>
      </form>
    </div>
  );
}
