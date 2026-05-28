import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomerDashboard from '../components/Dashboard/CustomerDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import OwnerDashboard from '../components/Dashboard/OwnerDashboard';
export default function Dashboard() {
  const [role, setRole] = useState('');
  useEffect(() => { const token = localStorage.getItem('token'); if(token) setRole(JSON.parse(atob(token.split('.')[1])).role); }, []);
  if (role === 'customer') return <CustomerDashboard />;
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'owner') return <OwnerDashboard />;
  return <div>Loading...</div>;
}
