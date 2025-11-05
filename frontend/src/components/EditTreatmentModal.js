import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const EditTreatmentModal = ({ isOpen, onClose, onSuccess, treatment }) => {
  const [formData, setFormData] = useState({
    medication: '',
    procedure: '',
    follow_up_date: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (treatment) {
      setFormData({
        medication: treatment.medication || '',
        procedure: treatment.procedure || '',
        follow_up_date: treatment.follow_up_date || ''
      });
    }
  }, [treatment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.medication.trim() && !formData.procedure.trim()) {
      setError('Please enter medication or procedure');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.updateTreatment(treatment.treatment_id, formData);
      onSuccess('Treatment updated successfully!');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update treatment');
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
          <h2>✏️ Edit Treatment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="medication">Medication</label>
            <input
              className="neo-input"
              type="text"
              id="medication"
              name="medication"
              value={formData.medication}
              onChange={handleChange}
              placeholder="e.g., Aspirin 100mg"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="procedure">Procedure / Dosage</label>
            <textarea
              className="neo-input"
              id="procedure"
              name="procedure"
              value={formData.procedure}
              onChange={handleChange}
              placeholder="e.g., Take twice daily after meals"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="follow_up_date">Follow-up Date</label>
            <input
              className="neo-input"
              type="date"
              id="follow_up_date"
              name="follow_up_date"
              value={formData.follow_up_date}
              onChange={handleChange}
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
              {isSubmitting ? 'Updating...' : '💾 Update Treatment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTreatmentModal;
