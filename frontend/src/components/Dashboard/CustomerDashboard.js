import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CustomerDashboard() {
  const [data, setData] = useState({ user: {}, cvs: [], orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/dashboard/customer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Dashboard</h2>
      <div className="bg-blue-100 p-4 rounded-lg mb-6">
        <p><strong>Name:</strong> {data.user.name}</p>
        <p><strong>Plan:</strong> {data.user.tier} {data.user.tierExpiry && `(expires ${new Date(data.user.tierExpiry).toLocaleDateString()})`}</p>
        {data.user.tier === 'free' && <p><strong>Free credits left:</strong> {data.user.credits} / 2 this month</p>}
      </div>

      <h3 className="text-xl font-semibold mb-2">Your CVs</h3>
      {data.cvs.length === 0 && <p className="text-gray-500">No CVs uploaded yet.</p>}
      {data.cvs.map(cv => (
        <div key={cv._id} className="border p-3 rounded mb-2">
          <p><strong>{cv.title}</strong> - ATS Score: {cv.atsScore || 'Not scored yet'}</p>
          <p className="text-sm text-gray-500">Uploaded: {new Date(cv.createdAt).toLocaleDateString()}</p>
        </div>
      ))}

      <h3 className="text-xl font-semibold mt-6 mb-2">Recent Orders</h3>
      {data.orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
      {data.orders.map(order => (
        <div key={order._id} className="border p-3 rounded mb-2">
          <p><strong>{order.tier}</strong> - R{order.amount} - {order.paymentStatus}</p>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
