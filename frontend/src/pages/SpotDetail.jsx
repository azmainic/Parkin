import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaMapMarkerAlt, FaStar, FaArrowLeft } from 'react-icons/fa';

const SpotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    vehicleNumber: '',
    vehicleType: 'car',
    startTime: '',
    endTime: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const res = await api.get(`/spots/${id}`);
        setSpot(res.data.data);
      } catch (error) {
        console.error('Error fetching spot:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpot();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBookingError('');
    setBookingLoading(true);

    try {
      const res = await api.post('/bookings', {
        spotId: id,
        ...bookingData
      });
      alert('Booking confirmed!');
      navigate('/my-bookings');
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '80px' }}>Loading...</div>;
  if (!spot) return <div className="container" style={{ paddingTop: '80px' }}>Spot not found</div>;

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <FaArrowLeft /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Left: Details */}
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{spot.name}</h1>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            <FaMapMarkerAlt /> {spot.location}, {spot.city}
          </p>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="info" style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span className="label">Total Spots</span>
              <span className="value">{spot.totalSpots}</span>
            </div>
            <div className="info" style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span className="label">Available</span>
              <span className="value" style={{ color: spot.availableSpots > 10 ? '#10b981' : '#f59e0b' }}>
                {spot.availableSpots} spots
              </span>
            </div>
            <div className="info" style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span className="label">Max Stay</span>
              <span className="value">{spot.maxStay} hours</span>
            </div>
            <div className="info" style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span className="label">Price</span>
              <span className="value" style={{ fontWeight: '700', color: '#4f46e5', fontSize: '20px' }}>
                {spot.isFree ? 'FREE' : `£${spot.hourlyRate}/hour`}
              </span>
            </div>
            <div className="info" style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span className="label">Rating</span>
              <span className="value"><FaStar style={{ color: '#f59e0b' }} /> {spot.rating} ({spot.totalReviews} reviews)</span>
            </div>
          </div>

          {spot.amenities?.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Amenities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {spot.amenities.map((amenity, i) => (
                  <span key={i} style={{ 
                    background: '#f3f4f6', 
                    padding: '4px 14px', 
                    borderRadius: '50px',
                    fontSize: '14px'
                  }}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {spot.restrictions?.length > 0 && (
            <div className="card">
              <h3>Restrictions</h3>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#6b7280' }}>
                {spot.restrictions.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Booking Form */}
        <div className="card" style={{ position: 'sticky', top: '100px' }}>
          <h2 style={{ marginBottom: '8px' }}>Book This Spot</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {spot.availableSpots > 0 ? '✅ Available now' : '❌ Currently full'}
          </p>

          {bookingError && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              {bookingError}
            </div>
          )}

          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>Vehicle Number</label>
              <input
                type="text"
                placeholder="AB12 CDE"
                value={bookingData.vehicleNumber}
                onChange={(e) => setBookingData({ ...bookingData, vehicleNumber: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                value={bookingData.vehicleType}
                onChange={(e) => setBookingData({ ...bookingData, vehicleType: e.target.value })}
              >
                <option value="car">Car</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Time</label>
              <input
                type="datetime-local"
                value={bookingData.startTime}
                onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="datetime-local"
                value={bookingData.endTime}
                onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={bookingLoading || spot.availableSpots === 0}
              style={{ width: '100%' }}
            >
              {bookingLoading ? 'Booking...' : spot.availableSpots === 0 ? 'Sold Out' : 'Book Now'}
            </button>

            {!isAuthenticated && (
              <p style={{ textAlign: 'center', marginTop: '12px', color: '#6b7280', fontSize: '14px' }}>
                Please <a href="/login" style={{ color: '#4f46e5' }}>login</a> to book
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpotDetail;