import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const EditDoctorModal = ({ isOpen, onClose, onSuccess, doctor }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    contact_number: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        specialization: doctor.specialization || '',
        contact_number: doctor.contact_number || '',
        email: doctor.email || ''
      });
    }
  }, [doctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Doctor name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.updateDoctor(doctor.doctor_id, formData);
      onSuccess('Doctor updated successfully!');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update doctor');
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
          <h2>✏️ Edit Doctor</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Doctor Name *</label>
            <input
              className="neo-input"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Dr. John Smith"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="specialization">Specialization</label>
            <input
              className="neo-input"
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g., Cardiologist"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact_number">Contact Number</label>
            <input
              className="neo-input"
              type="tel"
              id="contact_number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="e.g., +1234567890"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="neo-input"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., doctor@hospital.com"
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
              {isSubmitting ? 'Updating...' : '💾 Update Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDoctorModal;
