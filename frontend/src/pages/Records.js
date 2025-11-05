import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AddRecordModal from '../components/AddRecordModal';
import EditRecordModal from '../components/EditRecordModal';
import VoiceRecordModal from '../components/VoiceRecordModal';
import { apiService } from '../services/api';

const Records = ({ user, onLogout }) => {
  const [userRecords, setUserRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [recordsData, doctorsData] = await Promise.all([
        apiService.getUserHealthRecords(user.user_id),
        apiService.getDoctors()
      ]);
      
      setUserRecords(recordsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching user records:', error);
    } finally {
      setLoading(false);
    }
  }, [user.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReload = async () => {
    setLoading(true);
    try {
      const [recordsData, doctorsData] = await Promise.all([
        apiService.getUserHealthRecords(user.user_id),
        apiService.getDoctors()
      ]);
      
      setUserRecords(recordsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching user records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this health record?')) {
      try {
        await apiService.deleteHealthRecord(recordId);
        setUserRecords(userRecords.filter(record => record.record_id !== recordId));
        setSuccessMessage('Health record deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting health record:', error);
        alert('Failed to delete health record');
      }
    }
  };

  const filteredRecords = userRecords.filter(record =>
    record.condition_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.severity?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="app">
        <Navbar user={user} onLogout={onLogout} />
        <div className="page-container">
          <div className="loading-container">
            <div className="neo-spinner"></div>
            <p className="loading-text">Loading health records...</p>
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
          <h1 className="page-title">Health Records</h1>
          <p className="page-subtitle">Track your medical history and health conditions</p>
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
              📄 Add Record
            </button>
            <button 
              className="neo-btn neo-btn-primary"
              onClick={() => setShowVoiceModal(true)}
            >
              🎤 Voice Record
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="success-card">
            <p>{successMessage}</p>
          </div>
        )}

        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Medical Records</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search records by condition, diagnosis, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neo-input search-input"
              />
            </div>
          </div>

          <div className="records-grid">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const doctor = doctors.find(d => d.doctor_id === record.doctor_id);
                return (
                  <div key={record.record_id} className="record-card">
                    <div className="record-header">
                      <div className="record-info">
                        <h3 className="record-title">
                          {record.diagnosis || 'Medical Record'}
                        </h3>
                        <div className="record-meta">
                          <span className="record-id">Record ID: #{record.record_id}</span>
                          <span className="record-date">
                            📅 {formatDate(record.record_date || record.date_recorded || record.date)}
                          </span>
                        </div>
                      </div>
                      <div className="card-actions-row">
                        {record.severity && (
                          <div className={`severity-badge severity-${record.severity.toLowerCase()}`}>
                            {record.severity}
                          </div>
                        )}
                        <div className="card-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditRecord(record)}
                            title="Edit Record"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteRecord(record.record_id)}
                            title="Delete Record"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {doctor && (
                      <div className="doctor-section">
                        <h4 className="section-title">👨‍⚕️ Healthcare Provider</h4>
                        <div className="doctor-details">
                          <div className="doctor-name">Dr. {doctor.name}</div>
                          <div className="doctor-specialization">{doctor.specialization}</div>
                          {doctor.contact_number && (
                            <div className="doctor-contact">📞 {doctor.contact_number}</div>
                          )}
                          {doctor.email && (
                            <div className="doctor-contact">📧 {doctor.email}</div>
                          )}
                          {doctor.hospital && (
                            <div className="doctor-contact">🏥 {doctor.hospital}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {record.file_path && (
                      <div className="file-section">
                        <h4 className="section-title">📄 Attached File</h4>
                        <div className="file-path">{record.file_path}</div>
                      </div>
                    )}

                    {(record.notes && record.notes.trim()) && (
                      <div className="notes-section">
                        <h4 className="section-title">📝 Notes</h4>
                        <div className="notes-content">{record.notes}</div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <h3 className="empty-title">
                  {searchTerm ? 'No records found' : 'No health records yet'}
                </h3>
                <p className="empty-text">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Start tracking your health by adding your first record.'}
                </p>
              </div>
            )}
          </div>

          {filteredRecords.length > 0 && (
            <div className="stats-summary">
              <p>
                Showing {filteredRecords.length} of {userRecords.length} records
              </p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddRecordModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={(message) => {
            setSuccessMessage(message);
            fetchData();
            setShowAddModal(false);
            setTimeout(() => setSuccessMessage(''), 5000);
          }}
          doctors={doctors}
          user={user}
        />
      )}

      {showEditModal && selectedRecord && (
        <EditRecordModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRecord(null);
          }}
          onSuccess={(message) => {
            setSuccessMessage(message);
            fetchData();
            setShowEditModal(false);
            setSelectedRecord(null);
            setTimeout(() => setSuccessMessage(''), 5000);
          }}
          record={selectedRecord}
          doctors={doctors}
        />
      )}

      {showVoiceModal && (
        <VoiceRecordModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onSuccess={(message) => {
            setSuccessMessage(message);
            fetchData();
            setShowVoiceModal(false);
            setTimeout(() => setSuccessMessage(''), 5000);
          }}
          user={user}
        />
      )}
    </div>
  );
};

export default Records;
