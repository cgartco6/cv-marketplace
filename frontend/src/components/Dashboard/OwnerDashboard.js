import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OwnerDashboard() {
  const [data, setData] = useState({ totalRevenue: 0, upgradeReserve: 0, recentPayouts: [], activeUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/dashboard/owner', {
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

  const forcePayout = async () => {
    if (!window.confirm('Force daily payout now?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/force-payout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Payout triggered. Refresh to see updates.');
    } catch (err) {
      alert('Failed: ' + err.response?.data?.error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading owner data...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Owner Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 rounded shadow">Total Revenue: R{data.totalRevenue}</div>
        <div className="bg-red-100 p-4 rounded shadow">Upgrade Reserve: R{data.upgradeReserve} / R5000</div>
        <div className="bg-indigo-100 p-4 rounded shadow">Active Users (7d): {data.activeUsers}</div>
      </div>

      <h3 className="text-xl font-semibold mb-2">Recent Payouts</h3>
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left">Date</th><th>Total Revenue</th><th>SA Share</th><th>Africa Share</th><th>Upgrade</th>
            </tr>
          </thead>
          <tbody>
            {data.recentPayouts.map(p => (
              <tr key={p._id} className="border-b">
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td>R{p.totalRevenue}</td>
                <td>R{p.southAfricanBankShare}</td>
                <td>R{p.africanBankShare}</td>
                <td>R{p.upgradeShare}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={forcePayout} className="mt-6 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
        💸 Force Daily Payout
      </button>
    </div>
  );
}
