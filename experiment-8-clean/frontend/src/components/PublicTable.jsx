import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function PublicTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/public/welcome');
        setData([response.data]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <h1>Public Market Data</h1>
      <table className="data-table">
        <thead><tr><th>Message</th><th>Time</th></tr></thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i}><td>{item.message}</td><td>{item.timestamp || 'N/A'}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
