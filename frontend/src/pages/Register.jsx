import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaGoogle, FaMicrosoft, FaApple, FaFacebook } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSocialSignup = (provider) => {
    alert(`🔐 Sign up with ${provider} would be implemented here.\n\nIn a production app, this would redirect to ${provider} OAuth.`);
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h2>Create Account</h2>
        <p className="subtitle">Join ParkIn and park smarter</p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* Social Signup Buttons */}
        <div className="social-login">
          <button 
            onClick={() => handleSocialSignup('Google')}
            className="social-btn google"
          >
            <FaGoogle /> Sign up with Google
          </button>
          <button 
            onClick={() => handleSocialSignup('Microsoft')}
            className="social-btn microsoft"
          >
            <FaMicrosoft /> Sign up with Microsoft
          </button>
          <button 
            onClick={() => handleSocialSignup('Apple')}
            className="social-btn apple"
          >
            <FaApple /> Sign up with Apple
          </button>
          <button 
            onClick={() => handleSocialSignup('Facebook')}
            className="social-btn facebook"
          >
            <FaFacebook /> Sign up with Facebook
          </button>
        </div>

        <div className="auth-divider">
          <span>or sign up with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Driver"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                minLength="6"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <div className="input-with-icon">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+447700123456"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <div className="input-with-icon">
              <FaMapMarkerAlt className="input-icon" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Street, City"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;