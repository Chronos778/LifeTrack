import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Records from './pages/Records';
import Treatments from './pages/Treatments';
import Chatbot from './pages/Chatbot';
import APITest from './pages/APITest';
import { ThemeProvider } from './context/ThemeContext';
import './modern-ui.css';
import './light-theme.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user session from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('📝 handleLogin called with:', userData);
    setUser(userData);
    // Store user data in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('✅ User saved to localStorage');
  };

  const handleLogout = () => {
    setUser(null);
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to="/home" replace /> : <Register />
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/home" 
              element={
                user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/doctors" 
              element={
                user ? <Doctors user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/records" 
              element={
                user ? <Records user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/treatments" 
              element={
                user ? <Treatments user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/chatbot" 
              element={
                user ? <Chatbot user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              } 
            />
            
            {/* API Test Route - for debugging */}
            <Route 
              path="/api-test" 
              element={<APITest />} 
            />
            
            {/* Default Route */}
            <Route 
              path="/" 
              element={<Navigate to={user ? "/home" : "/login"} replace />} 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
