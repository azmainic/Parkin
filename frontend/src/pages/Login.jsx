import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaGoogle, FaMicrosoft, FaApple, FaFacebook } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    // Social login - currently showing demo alert
    // In production, implement OAuth flow
    alert(`🔐 ${provider} login would be implemented here.\n\nIn a production app, this would redirect to ${provider} OAuth.`);
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your ParkIn account</p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="social-login">
          <button 
            onClick={() => handleSocialLogin('Google')}
            className="social-btn google"
          >
            <FaGoogle /> Continue with Google
          </button>
          <button 
            onClick={() => handleSocialLogin('Microsoft')}
            className="social-btn microsoft"
          >
            <FaMicrosoft /> Continue with Microsoft
          </button>
          <button 
            onClick={() => handleSocialLogin('Apple')}
            className="social-btn apple"
          >
            <FaApple /> Continue with Apple
          </button>
          <button 
            onClick={() => handleSocialLogin('Facebook')}
            className="social-btn facebook"
          >
            <FaFacebook /> Continue with Facebook
          </button>
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;