import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AddDoctorModal from '../components/AddDoctorModal';
import EditDoctorModal from '../components/EditDoctorModal';
import VoiceAddDoctorModal from '../components/VoiceAddDoctorModal';
import { apiService } from '../services/api';

const Doctors = ({ user, onLogout }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDoctors();
      setDoctors(response);
    } catch (error) {
      setError('Failed to fetch doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor? This will also delete all related health records and treatments.')) {
      try {
        await apiService.deleteDoctor(doctorId);
        setDoctors(doctors.filter(doctor => doctor.doctor_id !== doctorId));
      } catch (error) {
        setError('Failed to delete doctor');
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const handleReload = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getDoctors();
      setDoctors(response);
    } catch (error) {
      setError('Failed to fetch doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="app">
        <Navbar user={user} onLogout={onLogout} />
        <div className="page-container">
          <div className="loading-container">
            <div className="neo-spinner"></div>
            <p className="loading-text">Loading doctors...</p>
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
          <h1 className="page-title">Healthcare Providers</h1>
          <p className="page-subtitle">Manage your trusted medical professionals</p>
          <div className="header-actions">
            <button 
              className="neo-btn neo-btn-secondary"
              onClick={handleReload}
              disabled={loading}
            >
              {loading ? '🔄' : '↻'} Refresh
            </button>
            <button 
              className="neo-btn neo-btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              👨‍⚕️ Add Doctor
            </button>
            <button 
              className="neo-btn neo-btn-primary"
              onClick={() => setShowVoiceModal(true)}
            >
              🎤 Voice Doctor
            </button>
          </div>
        </div>

        {error && (
          <div className="error-card">
            <p>{error}</p>
          </div>
        )}

        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Your Doctors</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search doctors by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neo-input search-input"
              />
            </div>
          </div>

          <div className="doctors-grid">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <div key={doctor.doctor_id} className="doctor-card">
                  <div className="doctor-header">
                    <div className="doctor-avatar">
                      👨‍⚕️
                    </div>
                    <div className="doctor-info">
                      <h3 className="doctor-name">
                        Dr. {doctor.name}
                      </h3>
                      <div className="doctor-id">
                        ID: #{doctor.doctor_id}
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditDoctor(doctor)}
                        title="Edit Doctor"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteDoctor(doctor.doctor_id)}
                        title="Delete Doctor"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="specialization-badge">
                    {doctor.specialization}
                  </div>

                  <div className="doctor-details">
                    {doctor.contact_number && (
                      <div className="detail-item">
                        <span className="detail-icon">📞</span>
                        <span className="detail-text">{doctor.contact_number}</span>
                      </div>
                    )}
                    
                    {doctor.email && doctor.email.trim() && (
                      <div className="detail-item">
                        <span className="detail-icon">📧</span>
                        <span className="detail-text">{doctor.email}</span>
                      </div>
                    )}
                    
                    {doctor.hospital && doctor.hospital.trim() && (
                      <div className="detail-item">
                        <span className="detail-icon">🏥</span>
                        <span className="detail-text">{doctor.hospital}</span>
                      </div>
                    )}

                    {doctor.address && doctor.address.trim() && (
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span className="detail-text">{doctor.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3 className="empty-title">
                  {searchTerm ? 'No doctors found' : 'No doctors added yet'}
                </h3>
                <p className="empty-text">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding your first healthcare provider.'}
                </p>
              </div>
            )}
          </div>

          {filteredDoctors.length > 0 && (
            <div className="stats-summary">
              <p>
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddDoctorModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={(message) => {
            fetchDoctors();
            setShowAddModal(false);
          }}
        />
      )}

      {showEditModal && selectedDoctor && (
        <EditDoctorModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDoctor(null);
          }}
          onSuccess={(message) => {
            fetchDoctors();
            setShowEditModal(false);
            setSelectedDoctor(null);
          }}
          doctor={selectedDoctor}
        />
      )}

      {showVoiceModal && (
        <VoiceAddDoctorModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onSuccess={(message) => {
            fetchDoctors();
            setShowVoiceModal(false);
          }}
          user={user}
        />
      )}
    </div>
  );
};

export default Doctors;
