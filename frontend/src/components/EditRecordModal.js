import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const EditRecordModal = ({ isOpen, onClose, onSuccess, record, doctors }) => {
  const [formData, setFormData] = useState({
    doctor_id: '',
    diagnosis: '',
    record_date: '',
    file_path: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        doctor_id: record.doctor_id || '',
        diagnosis: record.diagnosis || '',
        record_date: record.record_date || '',
        file_path: record.file_path || ''
      });
    }
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.diagnosis.trim()) {
      setError('Diagnosis is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.updateHealthRecord(record.record_id, formData);
      onSuccess('Health record updated successfully!');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update health record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit Health Record</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="doctor_id">Doctor</label>
            <select
              className="neo-input"
              id="doctor_id"
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleChange}
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="diagnosis">Diagnosis *</label>
            <textarea
              className="neo-input"
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Enter diagnosis"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="record_date">Date</label>
            <input
              className="neo-input"
              type="date"
              id="record_date"
              name="record_date"
              value={formData.record_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="file_path">File Path</label>
            <input
              className="neo-input"
              type="text"
              id="file_path"
              name="file_path"
              value={formData.file_path}
              onChange={handleChange}
              placeholder="Path to medical file (optional)"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              className="neo-btn neo-btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="neo-btn neo-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : '💾 Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecordModal;
