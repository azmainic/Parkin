import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';

const SpotCard = ({ spot }) => {
  const availabilityClass = spot.availableSpots > 10 ? 'available' : spot.availableSpots > 0 ? 'limited' : 'full';
  const availabilityText = spot.availableSpots > 10 ? 'Available' : spot.availableSpots > 0 ? 'Limited' : 'Full';

  return (
    <div className="card spot-card">
      <div className="spot-card-header">
        <h3>{spot.name}</h3>
        <div className="location">
          <FaMapMarkerAlt /> {spot.location}, {spot.city}
        </div>
      </div>
      
      <div className="spot-card-body">
        <div className="info">
          <span className="label">Total Spots</span>
          <span className="value">{spot.totalSpots}</span>
        </div>
        <div className="info">
          <span className="label">Available</span>
          <span className="value">
            <span className={`availability-dot ${availabilityClass}`}></span>
            {spot.availableSpots} ({availabilityText})
          </span>
        </div>
        <div className="info">
          <span className="label">Max Stay</span>
          <span className="value">{spot.maxStay} hours</span>
        </div>
        {spot.isFree && (
          <div className="info">
            <span className="label"></span>
            <span className="free-badge">FREE</span>
          </div>
        )}
      </div>
      
      <div className="spot-card-footer">
        <div className="price">
          {spot.isFree ? 'FREE' : `£${spot.hourlyRate}`}
          <span>{spot.isFree ? '' : '/hour'}</span>
        </div>
        <Link to={`/spots/${spot._id}`} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default SpotCard;