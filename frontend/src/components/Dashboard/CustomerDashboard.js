import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function CustomerDashboard() {
  const [data, setData] = useState({ user: {}, cvs: [], orders: [] });
  useEffect(() => { axios.get('/api/dashboard/customer').then(res => setData(res.data)); }, []);
  return (<div className="p-6"><h2>Dashboard</h2><p>Plan: {data.user.tier} | Credits: {data.user.credits}</p><h3>Your CVs</h3>{data.cvs.map(cv=><div key={cv._id}>{cv.title} - ATS: {cv.atsScore||'N/A'}</div>)}</div>);
}
