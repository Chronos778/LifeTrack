import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AddTreatmentModal from '../components/AddTreatmentModal';
import { apiService } from '../services/api';

const Treatments = ({ user, onLogout }) => {
  const [treatments, setTreatments] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [treatmentsData, recordsData, doctorsData] = await Promise.all([
        apiService.getUserTreatments(user.user_id),
        apiService.getUserHealthRecords(user.user_id),
        apiService.getDoctors()
      ]);
      
      setTreatments(treatmentsData);
      setHealthRecords(recordsData);
      setDoctors(doctorsData);
    } catch (error) {
      setError('Failed to fetch treatments');
      console.error('Error fetching treatments:', error);
    } finally {
      setLoading(false);
    }
  }, [user.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteTreatment = async (treatmentId) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      try {
        await apiService.deleteTreatment(treatmentId);
        setTreatments(treatments.filter(treatment => treatment.treatment_id !== treatmentId));
      } catch (error) {
        setError('Failed to delete treatment');
        console.error('Error deleting treatment:', error);
      }
    }
  };

  const handleReload = async () => {
    setLoading(true);
    setError('');
    await fetchData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTreatments = treatments.filter(treatment => {
    const record = healthRecords.find(r => r.record_id === treatment.record_id);
    const searchString = `${treatment.medication || ''} ${treatment.procedure || ''} ${record?.diagnosis || ''} ${treatment.status || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="app">
        <Navbar user={user} onLogout={onLogout} />
        <div className="page-container">
          <div className="loading-container">
            <div className="neo-spinner"></div>
            <p className="loading-text">Loading treatments...</p>
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
          <h1 className="page-title">Treatment Plans</h1>
          <p className="page-subtitle">Manage your medications and therapeutic interventions</p>
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
              💊 Add Treatment
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
            <h3 className="card-title">Active Treatments</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search treatments by medication, condition, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neo-input search-input"
              />
            </div>
          </div>

          <div className="treatments-grid">
            {filteredTreatments.length > 0 ? (
              filteredTreatments.map((treatment) => {
                const record = healthRecords.find(r => r.record_id === treatment.record_id);
                const doctor = doctors.find(d => d.doctor_id === record?.doctor_id);
                
                return (
                  <div key={treatment.treatment_id} className="treatment-card">
                    <div className="treatment-header">
                      <div className="treatment-info">
                        <h3 className="treatment-title">
                          💊 {treatment.medication || 'Treatment'}
                        </h3>
                        <div className="treatment-id">
                          Treatment ID: #{treatment.treatment_id}
                        </div>
                        {treatment.dosage && (
                          <div className="dosage-badge">
                            {treatment.dosage}
                          </div>
                        )}
                      </div>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteTreatment(treatment.treatment_id)}
                        title="Delete Treatment"
                      >
                        🗑️
                      </button>
                    </div>

                    {record && (
                      <div className="condition-section">
                        <h4 className="section-title">🏥 Related Condition</h4>
                        <div className="condition-details">
                          <div className="condition-name">{record.diagnosis}</div>
                          <div className="condition-date">
                            Recorded: {formatDate(record.record_date)}
                          </div>
                        </div>
                      </div>
                    )}

                    {doctor && (
                      <div className="prescriber-section">
                        <h4 className="section-title">👨‍⚕️ Prescribed By</h4>
                        <div className="prescriber-details">
                          <div className="doctor-name">Dr. {doctor.name}</div>
                          <div className="doctor-specialization">{doctor.specialization}</div>
                          {doctor.contact_number && (
                            <div className="doctor-contact">📞 {doctor.contact_number}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {treatment.procedure && treatment.procedure.trim() && (
                      <div className="instructions-section">
                        <h4 className="section-title">📋 Instructions</h4>
                        <div className="instructions-content">{treatment.procedure}</div>
                      </div>
                    )}

                    <div className="treatment-details">
                      {treatment.frequency && (
                        <div className="detail-item">
                          <div className="detail-label">FREQUENCY</div>
                          <div className="detail-value">{treatment.frequency}</div>
                        </div>
                      )}

                      {treatment.status && (
                        <div className="detail-item">
                          <div className="detail-label">STATUS</div>
                          <div className={`status-badge status-${treatment.status.toLowerCase()}`}>
                            {treatment.status}
                          </div>
                        </div>
                      )}

                      {(treatment.start_date || treatment.date_prescribed) && (
                        <div className="detail-item">
                          <div className="detail-label">STARTED</div>
                          <div className="detail-value">
                            {formatDate(treatment.start_date || treatment.date_prescribed)}
                          </div>
                        </div>
                      )}

                      {treatment.follow_up_date && (
                        <div className="detail-item">
                          <div className="detail-label">FOLLOW-UP</div>
                          <div className="detail-value">
                            {formatDate(treatment.follow_up_date)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <h3 className="empty-title">
                  {searchTerm ? 'No treatments found' : 'No treatments added yet'}
                </h3>
                <p className="empty-text">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Start managing your health by adding your first treatment plan.'}
                </p>
              </div>
            )}
          </div>

          {filteredTreatments.length > 0 && (
            <div className="stats-summary">
              <p>
                Showing {filteredTreatments.length} of {treatments.length} treatments
              </p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddTreatmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={(message) => {
            fetchData();
            setShowAddModal(false);
          }}
          user={user}
        />
      )}
    </div>
  );
};

export default Treatments;
