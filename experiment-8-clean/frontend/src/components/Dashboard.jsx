import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('jwtToken')) navigate('/login');
    api.get('/user/profile').then(res => setProfile(res.data)).catch(() => {});
  }, [navigate]);

  return (
    <div className="container">
      <h1>Protected Dashboard</h1>
      {profile && <div className="code-block">{JSON.stringify(profile, null, 2)}</div>}
      <button className="btn btn-secondary" onClick={() => { localStorage.removeItem('jwtToken'); navigate('/login'); }}>Logout</button>
    </div>
  );
}
