import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-item nav-logo">
          <div className="logo">LifeTrack</div>
        </div>
        
        <div className="nav-item nav-links">
          <Link 
            to="/home" 
            className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>
          <Link 
            to="/doctors" 
            className={`nav-link ${location.pathname === '/doctors' ? 'active' : ''}`}
          >
            <span className="nav-icon">👨‍⚕️</span>
            <span className="nav-text">Doctors</span>
          </Link>
          <Link 
            to="/records" 
            className={`nav-link ${location.pathname === '/records' ? 'active' : ''}`}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Records</span>
          </Link>
          <Link 
            to="/treatments" 
            className={`nav-link ${location.pathname === '/treatments' ? 'active' : ''}`}
          >
            <span className="nav-icon">💊</span>
            <span className="nav-text">Treatments</span>
          </Link>
          <Link 
            to="/chatbot" 
            className={`nav-link ${location.pathname === '/chatbot' ? 'active' : ''}`}
          >
            <span className="nav-icon">🤖</span>
            <span className="nav-text">Chatbot</span>
          </Link>
        </div>
        
        <div className="nav-item nav-actions">
          <ThemeToggle />
          <button onClick={onLogout || logout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
