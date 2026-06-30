import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaMapMarkerAlt, FaCar } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRes = await api.get('/bookings');
        const data = bookingsRes.data.data;
        setBookings(data);
        
        const now = new Date();
        const upcoming = data.filter(b => new Date(b.startTime) > now && b.status !== 'cancelled');
        const completed = data.filter(b => b.status === 'completed' || b.status === 'cancelled');
        
        setStats({
          total: data.length,
          upcoming: upcoming.length,
          completed: completed.length
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>Welcome back, {user?.name}!</p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <FaCalendarAlt style={{ fontSize: '32px', color: '#4f46e5', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '28px' }}>{stats.total}</h3>
          <p style={{ color: '#6b7280' }}>Total Bookings</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <FaCar style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '28px' }}>{stats.upcoming}</h3>
          <p style={{ color: '#6b7280' }}>Upcoming</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <FaMapMarkerAlt style={{ fontSize: '32px', color: '#f59e0b', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '28px' }}>{stats.completed}</h3>
          <p style={{ color: '#6b7280' }}>Completed</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <Link to="/spots" className="btn btn-primary">Find Parking</Link>
        <Link to="/my-bookings" className="btn btn-secondary">View All Bookings</Link>
      </div>

      {/* Recent Bookings */}
      <h2 style={{ marginBottom: '16px' }}>Recent Bookings</h2>
      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#6b7280' }}>No bookings yet. Start parking with ParkIn!</p>
          <Link to="/spots" className="btn btn-primary" style={{ marginTop: '16px' }}>Find Parking</Link>
        </div>
      ) : (
        <div className="spots-grid">
          {bookings.slice(0, 4).map(booking => (
            <div key={booking._id} className="card spot-card">
              <div className="spot-card-header">
                <h3>{booking.spotName}</h3>
                <div className="location">Vehicle: {booking.vehicleNumber}</div>
              </div>
              <div className="spot-card-body">
                <div className="info">
                  <span className="label">Date</span>
                  <span className="value">{new Date(booking.startTime).toLocaleDateString()}</span>
                </div>
                <div className="info">
                  <span className="label">Time</span>
                  <span className="value">{new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}</span>
                </div>
                <div className="info">
                  <span className="label">Status</span>
                  <span className="value" style={{ 
                    color: booking.status === 'confirmed' ? '#10b981' : 
                           booking.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                  }}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;