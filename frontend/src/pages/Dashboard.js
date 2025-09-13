import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { apiService } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [data, setData] = useState({
    users: [],
    doctors: [],
    healthRecords: [],
    treatments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [users, doctors, healthRecords, treatments] = await Promise.all([
          apiService.getUsers(),
          apiService.getDoctors(),
          apiService.getHealthRecords(),
          apiService.getTreatments()
        ]);

        setData({
          users,
          doctors,
          healthRecords,
          treatments
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="app">
        <Navbar user={user} onLogout={onLogout} />
        <div className="page-container">
          <div className="loading-container">
            <div className="neo-spinner"></div>
            <p className="loading-text">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Navbar user={user} onLogout={onLogout} />
        <div className="page-container">
          <div className="error-card">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={onLogout} />

      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">System Dashboard</h1>
          <p className="page-subtitle">Overview of your LifeTrack personal health management system</p>
        </div>
        
        <div className="dashboard-grid">
          {/* Users Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">👥 Users</h2>
              <span className="dashboard-card-count">{data.users.length}</span>
            </div>
            <div className="dashboard-data-list">
              {data.users.length > 0 ? (
                data.users.slice(0, 5).map(user => (
                  <div key={user.user_id} className="dashboard-data-item">
                    <div className="dashboard-item-name">{user.name}</div>
                    <div className="dashboard-item-detail">
                      {user.age} years old • {user.gender} • {user.email}
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-no-data">No users found</div>
              )}
            </div>
          </div>

          {/* Doctors Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">👨‍⚕️ Doctors</h2>
              <span className="dashboard-card-count">{data.doctors.length}</span>
            </div>
            <div className="dashboard-data-list">
              {data.doctors.length > 0 ? (
                data.doctors.slice(0, 5).map(doctor => (
                  <div key={doctor.doctor_id} className="dashboard-data-item">
                    <div className="dashboard-item-name">Dr. {doctor.name}</div>
                    <div className="dashboard-item-detail">
                      {doctor.specialization} • {doctor.contact_number}
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-no-data">No doctors found</div>
              )}
            </div>
          </div>

          {/* Health Records Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">📄 Health Records</h2>
              <span className="dashboard-card-count">{data.healthRecords.length}</span>
            </div>
            <div className="dashboard-data-list">
              {data.healthRecords.length > 0 ? (
                data.healthRecords.slice(0, 5).map(record => (
                  <div key={record.record_id} className="dashboard-data-item">
                    <div className="dashboard-item-name">{record.diagnosis}</div>
                    <div className="dashboard-item-detail">
                      Date: {formatDate(record.record_date)} • User ID: {record.user_id}
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-no-data">No health records found</div>
              )}
            </div>
          </div>

          {/* Treatments Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">💊 Treatments</h2>
              <span className="dashboard-card-count">{data.treatments.length}</span>
            </div>
            <div className="dashboard-data-list">
              {data.treatments.length > 0 ? (
                data.treatments.slice(0, 5).map(treatment => (
                  <div key={treatment.treatment_id} className="dashboard-data-item">
                    <div className="dashboard-item-name">{treatment.medication}</div>
                    <div className="dashboard-item-detail">
                      {treatment.procedure}
                      {treatment.follow_up_date && (
                        <> • Follow-up: {formatDate(treatment.follow_up_date)}</>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-no-data">No treatments found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
