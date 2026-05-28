import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, paidUsers: 0, revenue: { today: 0 } });
  useEffect(() => { axios.get('/api/dashboard/admin').then(res => setMetrics(res.data)); }, []);
  return (<div><h2>Admin</h2><p>Users: {metrics.totalUsers} | Paid: {metrics.paidUsers} | Revenue today: R{metrics.revenue.today}</p></div>);
}
