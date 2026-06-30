import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCar, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaHome, FaMapMarkedAlt, FaCalendarAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <FaCar className="logo-icon" />
          <span>ParkIn</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            <FaHome /> Home
          </Link>
          <Link to="/spots" className="nav-link">
            <FaMapMarkedAlt /> Find Parking
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/my-bookings" className="nav-link">
                <FaCalendarAlt /> My Bookings
              </Link>
              <Link to="/dashboard" className="nav-link">
                <FaUser /> Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link">
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">
                <FaSignInAlt /> Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <FaUserPlus /> Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;