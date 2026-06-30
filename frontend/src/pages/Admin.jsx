import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaUsers, FaParking, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/users')
        ]);
        setStats(statsRes.data.data.stats);
        setUsers(usersRes.data.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <div className="container" style={{ paddingTop: '80px' }}>Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Admin Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>Welcome, {user?.name}</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <FaUsers style={{ fontSize: '32px', color: '#4f46e5', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '28px' }}>{stats?.totalUsers || 0}</h3>
          <p style={{ color: '#6b7280' }}>Total Users</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <FaParking style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '28px' }}>{stats?.totalSpots || 0}</h3>
          <p style={{ color: '#6b7280' }}>Parking Spots</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <FaCalendarAlt style={{ fontSize: '32px', color: '#f59e0b', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '28px' }}>{stats?.totalBookings || 0}</h3>
          <p style={{ color: '#6b7280' }}>Total Bookings</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <FaDollarSign style={{ fontSize: '32px', color: '#ef4444', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '28px' }}>£{stats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
          <p style={{ color: '#6b7280' }}>Total Revenue</p>
        </div>
      </div>

      {/* Users List */}
      <h2 style={{ marginBottom: '16px' }}>All Users</h2>
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px' }}>{u.name}</td>
                <td style={{ padding: '12px' }}>{u.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: u.role === 'admin' ? '#4f46e5' : u.role === 'council' ? '#f59e0b' : '#6b7280',
                    color: 'white',
                    padding: '2px 12px',
                    borderRadius: '50px',
                    fontSize: '12px'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    color: u.isActive ? '#10b981' : '#ef4444',
                    fontWeight: '600'
                  }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;