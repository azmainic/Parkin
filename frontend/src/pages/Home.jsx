import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SpotCard from '../components/SpotCard';
import { FaSearch, FaClock, FaCreditCard, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await api.get('/spots');
        setSpots(res.data.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching spots:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpots();
  }, []);

  const features = [
    { icon: <FaSearch />, title: 'Find Free Parking', description: 'Discover available parking spots near you in real-time.' },
    { icon: <FaClock />, title: 'Save Time', description: 'No more circling the block. Park instantly with ParkIn.' },
    { icon: <FaCreditCard />, title: 'Pay Digitally', description: 'Secure payments right from your phone. No cash needed.' },
    { icon: <FaShieldAlt />, title: 'Trusted & Verified', description: 'All parking spots verified by councils and users.' }
  ];

  return (
    <div>
      {/* Hero Section with Background Image */}
      <section className="hero hero-with-bg">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1>Find & Book Parking<br />In Seconds</h1>
          <p>
            ParkIn shows you available parking spots in real-time. 
            Book, pay, and go — all from your phone.
          </p>
          <div className="hero-buttons">
            <Link to="/spots" className="btn btn-primary">
              Find Parking Now
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-secondary">
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '8px' }}>
            Why ParkIn?
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '18px' }}>
            Everything you need for stress-free parking
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="card feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Spots Section */}
      <section className="features" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h2 style={{ fontSize: '28px' }}>Popular Parking Spots</h2>
              <p style={{ color: '#6b7280' }}>Book these popular spots before they're gone</p>
            </div>
            <Link to="/spots" className="btn btn-secondary">View All →</Link>
          </div>
          
          {loading ? (
            <p>Loading spots...</p>
          ) : (
            <div className="spots-grid">
              {spots.map(spot => (
                <SpotCard key={spot._id} spot={spot} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;