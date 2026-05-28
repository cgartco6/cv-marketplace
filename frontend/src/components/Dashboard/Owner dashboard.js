import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function OwnerDashboard() {
  const [data, setData] = useState({ totalRevenue: 0, upgradeReserve: 0 });
  useEffect(() => { axios.get('/api/dashboard/owner').then(res => setData(res.data)); }, []);
  return (<div><h2>Owner</h2><p>Total Revenue: R{data.totalRevenue} | Upgrade Reserve: R{data.upgradeReserve}</p></div>);
}
