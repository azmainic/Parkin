import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      background: '#1a1a2e',
      color: 'white',
      padding: '40px 0 20px',
      marginTop: '60px'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '30px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <FaCar style={{ fontSize: '28px', color: '#4f46e5' }} />
              <span style={{ fontSize: '24px', fontWeight: '800' }}>ParkIn</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6' }}>
              Find, book, and pay for parking in seconds. Smart parking for smart drivers.
            </p>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/spots" style={{ color: '#9ca3af', textDecoration: 'none' }}>Find Parking</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/dashboard" style={{ color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/my-bookings" style={{ color: '#9ca3af', textDecoration: 'none' }}>My Bookings</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px', color: '#9ca3af' }}>📧 support@parkin.com</li>
              <li style={{ marginBottom: '8px', color: '#9ca3af' }}>📞 +44 7700 123456</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" style={{ color: '#9ca3af', fontSize: '20px' }}><FaTwitter /></a>
              <a href="#" style={{ color: '#9ca3af', fontSize: '20px' }}><FaFacebook /></a>
              <a href="#" style={{ color: '#9ca3af', fontSize: '20px' }}><FaInstagram /></a>
              <a href="#" style={{ color: '#9ca3af', fontSize: '20px' }}><FaLinkedin /></a>
            </div>
          </div>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid #333' }} />
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', paddingTop: '20px' }}>
          © 2026 ParkIn. All rights reserved. Built with ❤️ for smart parking.
        </p>
      </div>
    </footer>
  );
};

export default Footer;