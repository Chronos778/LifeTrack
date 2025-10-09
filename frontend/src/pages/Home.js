import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AddDoctorModal from '../components/AddDoctorModal';
import AddRecordModal from '../components/AddRecordModal';
import { apiService } from '../services/api';

const Home = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    visitedDoctors: 0,
    totalRecords: 0,
    totalTreatments: 0,
    recentActivity: 0
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 Starting data fetch for user:', user.user_id);
      try {
        console.log('📡 Making API calls...');
        const [userRecords, userTreatments, visitedDoctors, allDoctorsData] = await Promise.all([
          apiService.getUserHealthRecords(user.user_id),
          apiService.getUserTreatments(user.user_id),
          apiService.getDoctorsVisitedByUser(user.user_id),
          apiService.getDoctors()
        ]);

        console.log('📊 Data received:', {
          userRecords: userRecords.length,
          userTreatments: userTreatments.length,
          visitedDoctors: visitedDoctors.length,
          allDoctors: allDoctorsData.length
        });

        setStats({
          visitedDoctors: visitedDoctors.length,
          totalRecords: userRecords.length,
          totalTreatments: userTreatments.length,
          recentActivity: userRecords.slice(0, 5).length
        });

        setRecentRecords(userRecords);
        setDoctors(visitedDoctors);
        setAllDoctors(allDoctorsData);
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
      } finally {
        console.log('✅ Data fetch completed');
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleReload = async () => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const [userRecords, userTreatments, visitedDoctors, allDoctorsData] = await Promise.all([
          apiService.getUserHealthRecords(user.user_id),
          apiService.getUserTreatments(user.user_id),
          apiService.getDoctorsVisitedByUser(user.user_id),
          apiService.getDoctors()
        ]);

        setStats({
          visitedDoctors: visitedDoctors.length,
          totalRecords: userRecords.length,
          totalTreatments: userTreatments.length,
          recentActivity: userRecords.slice(0, 5).length
        });

        setRecentRecords(userRecords);
        setDoctors(visitedDoctors);
        setAllDoctors(allDoctorsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    await fetchData();
  };

  const handleDoctorSuccess = (message) => {
    // Refresh data after adding doctor
    const fetchData = async () => {
      try {
        const [userRecords, userTreatments, visitedDoctors, allDoctorsData] = await Promise.all([
          apiService.getUserHealthRecords(user.user_id),
          apiService.getUserTreatments(user.user_id),
          apiService.getDoctorsVisitedByUser(user.user_id),
          apiService.getDoctors()
        ]);

        setStats({
          visitedDoctors: visitedDoctors.length,
          totalRecords: userRecords.length,
          totalTreatments: userTreatments.length,
          recentActivity: userRecords.slice(0, 5).length
        });

        setRecentRecords(userRecords);
        setDoctors(visitedDoctors);
        setAllDoctors(allDoctorsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
    setShowAddDoctorModal(false);
  };

  const handleRecordSuccess = (message) => {
    // Refresh data after adding record
    const fetchData = async () => {
      try {
        const [userRecords, userTreatments, visitedDoctors] = await Promise.all([
          apiService.getUserHealthRecords(user.user_id),
          apiService.getUserTreatments(user.user_id),
          apiService.getDoctorsVisitedByUser(user.user_id)
        ]);

        setStats({
          visitedDoctors: visitedDoctors.length,
          totalRecords: userRecords.length,
          totalTreatments: userTreatments.length,
          recentActivity: userRecords.slice(0, 5).length
        });

        setRecentRecords(userRecords);
        setDoctors(visitedDoctors);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
    setShowAddRecordModal(false);
  };

  return (
    <div className="app">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user.name}!</h1>
          <p className="page-subtitle">Your personal health companion is ready to help you manage your wellness journey</p>
          <button 
            className="neo-btn neo-btn-secondary reload-btn"
            onClick={handleReload}
            disabled={loading}
          >
            {loading ? '🔄' : '↻'} Refresh
          </button>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.visitedDoctors}</div>
            <div className="stat-label">Visited Doctors</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalRecords}</div>
            <div className="stat-label">Health Records</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalTreatments}</div>
            <div className="stat-label">Treatments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.recentActivity}</div>
            <div className="stat-label">Recent Activity</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="neo-spinner"></div>
            <p className="loading-text">Loading your health data...</p>
          </div>
        ) : (
          <>
            {/* Quick Action Buttons */}
            <div className="quick-actions-card">
              <h3 className="card-title">
                Quick Actions
              </h3>
              <div className="action-buttons">
                <button
                  className="neo-btn neo-btn-primary"
                  onClick={() => setShowAddDoctorModal(true)}
                >
                  👨‍⚕️ Add Doctor
                </button>
                <button
                  className="neo-btn neo-btn-primary"
                  onClick={() => setShowAddRecordModal(true)}
                >
                  📄 Add Record
                </button>
              </div>
            </div>

            {recentRecords.length === 0 && doctors.length === 0 && (
              <div className="welcome-card">
                <h3 className="welcome-title">Welcome to LifeTrack!</h3>
                <p className="welcome-text">
                  Begin your health journey by adding your first doctor or health record using the buttons above.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <AddDoctorModal
          isOpen={showAddDoctorModal}
          onClose={() => setShowAddDoctorModal(false)}
          onSuccess={handleDoctorSuccess}
        />
      )}

      {/* Add Record Modal */}
      {showAddRecordModal && (
        <AddRecordModal
          isOpen={showAddRecordModal}
          onClose={() => setShowAddRecordModal(false)}
          onSuccess={handleRecordSuccess}
          doctors={allDoctors}
          user={user}
        />
      )}
    </div>
  );
};

export default Home;
