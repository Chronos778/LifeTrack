import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './VoiceRecordModal.css';

const VoiceRecordModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      const doctorsData = await apiService.getDoctors();
      setDoctors(doctorsData);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
      setParsedData(null);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      processVoiceInput(speechResult);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processVoiceInput = async (text) => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await apiService.parseVoiceRecord(text, user.user_id);
      
      if (response.success && response.parsed_data) {
        setParsedData(response.parsed_data);
      } else {
        setError(response.message || 'Failed to parse voice input');
      }
    } catch (err) {
      setError('Failed to process voice input. Please try again.');
      console.error('Error processing voice:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData) {
      console.error('❌ No parsed data to save');
      return;
    }

    console.log('💾 Save button clicked! Parsed data:', parsedData);

    // Validate required fields
    if (!parsedData.diagnosis) {
      setError('Diagnosis is required. Please fill in the diagnosis field.');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      // Create health record
      const recordData = {
        user_id: user.user_id,
        doctor_id: parsedData.doctor_id || null, // Allow null doctor_id
        diagnosis: parsedData.diagnosis,
        record_date: parsedData.date || new Date().toISOString().split('T')[0],
        file_path: null
      };

      console.log('📤 Sending health record data:', recordData);

      const recordResponse = await apiService.addHealthRecord(recordData);
      console.log('✅ Health record saved:', recordResponse);

      // If medication exists, add treatment
      if (parsedData.medication && recordResponse.record_id) {
        const treatmentData = {
          record_id: recordResponse.record_id,
          medication: parsedData.medication,
          procedure: parsedData.dosage || '',
          follow_up_date: parsedData.follow_up_date || null
        };

        console.log('📤 Sending treatment data:', treatmentData);
        await apiService.addTreatment(treatmentData);
        console.log('✅ Treatment saved');
      }

      onSuccess('Health record added successfully from voice input!');
      handleClose();
    } catch (err) {
      const errorMsg = err.message || 'Failed to save record. Please try again.';
      setError(errorMsg);
      console.error('❌ Error saving record:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setTranscript('');
    setParsedData(null);
    setError('');
    setIsListening(false);
    setIsProcessing(false);
    onClose();
  };

  const handleFieldEdit = (field, value) => {
    setParsedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="voice-modal-overlay" onClick={handleClose}>
      <div className="voice-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="voice-modal-header">
          <h2>🎤 Voice-to-Record</h2>
          <button className="voice-close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="voice-modal-body">
          {/* Voice Input Section */}
          <div className="voice-input-section">
            <p className="voice-instructions">
              Click the microphone and speak your medical record. Example: 
              <em>"I visited Dr. Smith for high fever on October 15th, he prescribed paracetamol 500mg"</em>
            </p>

            <button 
              className={`voice-record-btn ${isListening ? 'listening' : ''}`}
              onClick={startListening}
              disabled={isProcessing || isListening}
            >
              {isListening ? (
                <>
                  <span className="pulse-dot"></span>
                  Listening...
                </>
              ) : (
                <>
                  🎤 Start Speaking
                </>
              )}
            </button>

            {transcript && (
              <div className="voice-transcript">
                <strong>You said:</strong>
                <p>"{transcript}"</p>
              </div>
            )}

            {isProcessing && (
              <div className="voice-processing">
                <div className="spinner"></div>
                <p>AI is analyzing your input...</p>
              </div>
            )}

            {error && (
              <div className="voice-error">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Parsed Data Preview */}
          {parsedData && (
            <div className="voice-parsed-section">
              <h3>✅ Extracted Information</h3>
              <p className="parsed-subtitle">Review and edit if needed:</p>

              <div className="voice-field">
                <label>Doctor:</label>
                <select 
                  value={parsedData.doctor_id || ''} 
                  onChange={(e) => handleFieldEdit('doctor_id', parseInt(e.target.value))}
                >
                  <option value="">Select doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.doctor_id} value={doc.doctor_id}>
                      {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="voice-field">
                <label>Diagnosis:</label>
                <input 
                  type="text" 
                  value={parsedData.diagnosis || ''} 
                  onChange={(e) => handleFieldEdit('diagnosis', e.target.value)}
                  placeholder="E.g., High Fever"
                />
              </div>

              <div className="voice-field">
                <label>Date:</label>
                <input 
                  type="date" 
                  value={parsedData.date || ''} 
                  onChange={(e) => handleFieldEdit('date', e.target.value)}
                />
              </div>

              <div className="voice-field">
                <label>Medication:</label>
                <input 
                  type="text" 
                  value={parsedData.medication || ''} 
                  onChange={(e) => handleFieldEdit('medication', e.target.value)}
                  placeholder="E.g., Paracetamol 500mg"
                />
              </div>

              <div className="voice-field">
                <label>Dosage/Instructions:</label>
                <input 
                  type="text" 
                  value={parsedData.dosage || ''} 
                  onChange={(e) => handleFieldEdit('dosage', e.target.value)}
                  placeholder="E.g., 3 times daily"
                />
              </div>

              {parsedData.follow_up_date && (
                <div className="voice-field">
                  <label>Follow-up Date:</label>
                  <input 
                    type="date" 
                    value={parsedData.follow_up_date || ''} 
                    onChange={(e) => handleFieldEdit('follow_up_date', e.target.value)}
                  />
                </div>
              )}

              <div className="voice-confidence">
                <small>AI Confidence: {parsedData.confidence || 'High'}</small>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="voice-modal-footer">
          <button 
            className="voice-btn voice-btn-secondary" 
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          {parsedData && (
            <button 
              className="voice-btn voice-btn-primary" 
              onClick={() => {
                console.log('🔘 Save Record button clicked!');
                console.log('📋 Current parsedData:', parsedData);
                console.log('✅ Doctor ID:', parsedData.doctor_id, 'Diagnosis:', parsedData.diagnosis);
                handleSave();
              }}
              disabled={isProcessing || !parsedData.diagnosis}
            >
              {isProcessing ? 'Saving...' : '💾 Save Record'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecordModal;
