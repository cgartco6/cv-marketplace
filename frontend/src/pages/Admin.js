import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function Admin() {
  const [users, setUsers] = useState([]);
  useEffect(() => { axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res=>setUsers(res.data)); }, []);
  return (<div className="p-6"><h1 className="text-2xl">Admin Panel</h1><table className="border"><thead><tr><th>Name</th><th>Email</th><th>Tier</th><tr></thead><tbody>{users.map(u=><tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.tier}</td></tr>)}</tbody></table></div>);
}
