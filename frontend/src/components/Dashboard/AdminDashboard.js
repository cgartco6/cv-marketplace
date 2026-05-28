import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, paidUsers: 0, revenue: { today: 0 }, topPlans: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/dashboard/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Loading admin data...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded shadow">Total Users: {metrics.totalUsers}</div>
        <div className="bg-blue-100 p-4 rounded shadow">Paid Users: {metrics.paidUsers}</div>
        <div className="bg-purple-100 p-4 rounded shadow">Today's Revenue: R{metrics.revenue?.today || 0}</div>
      </div>
      <h3 className="text-xl font-semibold mb-2">Revenue by Plan</h3>
      <div className="bg-white p-4 rounded shadow">
        {metrics.topPlans.length === 0 && <p>No data yet.</p>}
        {metrics.topPlans.map(plan => (
          <div key={plan._id} className="flex justify-between border-b py-2">
            <span className="capitalize">{plan._id}</span>
            <span>R{plan.total}</span>
            <span>{plan.count} orders</span>
          </div>
        ))}
      </div>
    </div>
  );
}
