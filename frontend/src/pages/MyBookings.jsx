import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaCar } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings');
        setBookings(res.data.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.patch(`/bookings/${id}/status`, { status: 'cancelled' });
      setBookings(bookings.map(b => 
        b._id === id ? { ...b, status: 'cancelled' } : b
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>My Bookings</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>Manage all your parking bookings</p>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <FaCar style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No Bookings Yet</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>You haven't made any parking bookings yet.</p>
          <a href="/spots" className="btn btn-primary">Find Parking Now</a>
        </div>
      ) : (
        <div className="spots-grid">
          {bookings.map(booking => (
            <div key={booking._id} className="card spot-card">
              <div className="spot-card-header">
                <h3>{booking.spotName}</h3>
                <div className="location">
                  <FaMapMarkerAlt /> Booking #{booking.bookingId}
                </div>
              </div>
              <div className="spot-card-body">
                <div className="info">
                  <span className="label"><FaCalendarAlt /> Date</span>
                  <span className="value">{new Date(booking.startTime).toLocaleDateString()}</span>
                </div>
                <div className="info">
                  <span className="label"><FaClock /> Time</span>
                  <span className="value">
                    {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="info">
                  <span className="label"><FaCar /> Vehicle</span>
                  <span className="value">{booking.vehicleNumber}</span>
                </div>
                <div className="info">
                  <span className="label">Duration</span>
                  <span className="value">{booking.duration} hours</span>
                </div>
                <div className="info">
                  <span className="label">Amount</span>
                  <span className="value" style={{ fontWeight: '700', color: '#4f46e5' }}>
                    {booking.totalAmount === 0 ? 'FREE' : `£${booking.totalAmount.toFixed(2)}`}
                  </span>
                </div>
                <div className="info">
                  <span className="label">Status</span>
                  <span className="value" style={{ 
                    color: booking.status === 'confirmed' ? '#10b981' : 
                           booking.status === 'cancelled' ? '#ef4444' : 
                           booking.status === 'completed' ? '#6b7280' : '#f59e0b',
                    fontWeight: '600'
                  }}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="spot-card-footer">
                {booking.status === 'pending' || booking.status === 'confirmed' ? (
                  <button 
                    onClick={() => cancelBooking(booking._id)}
                    className="btn btn-danger"
                    style={{ padding: '8px 20px', fontSize: '14px' }}
                  >
                    Cancel Booking
                  </button>
                ) : (
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {booking.status === 'completed' ? '✓ Completed' : 'Cancelled'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;