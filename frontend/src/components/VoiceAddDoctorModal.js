import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './VoiceAddDoctorModal.css';

const VoiceAddDoctorModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [recognition, setRecognition] = useState(null);

  // Debug: Log when parsedData changes
  useEffect(() => {
    if (parsedData) {
      console.log('🔍 parsedData updated:', parsedData);
      console.log('🔍 name:', parsedData.name);
      console.log('🔍 specialization:', parsedData.specialization);
      console.log('🔍 Button should be:', (!parsedData.name || !parsedData.specialization) ? 'DISABLED' : 'ENABLED');
    }
  }, [parsedData]);

  useEffect(() => {
    // Initialize speech recognition
    let recognitionInstance = null;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let currentFinalTranscript = '';

        // Process all results from the start to accumulate everything
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Combine final and interim for display
        setTranscript(prev => {
          const base = currentFinalTranscript || prev.split('|')[0] || '';
          return base + interimTranscript;
        });
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
          recognitionInstance.abort();
        } catch (err) {
          console.log('Recognition cleanup:', err);
        }
      }
    };
  }, []);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen && recognition) {
      try {
        recognition.stop();
        recognition.abort();
        setIsListening(false);
        setTranscript('');
        setParsedData(null);
        setError('');
      } catch (err) {
        console.log('Modal close cleanup:', err);
      }
    }
  }, [isOpen, recognition]);

  const startListening = () => {
    if (!recognition) {
      setError('Speech recognition not initialized. Please refresh and try again.');
      return;
    }

    if (isListening) {
      setError('Already listening. Please wait...');
      return;
    }

    setTranscript('');
    setError('');
    setParsedData(null);
    
    try {
      recognition.start();
      setIsListening(true);
      console.log('✅ Speech recognition started');
    } catch (err) {
      console.error('❌ Failed to start recognition:', err);
      setError(`Failed to start: ${err.message}. Try refreshing the page.`);
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      try {
        recognition.stop();
        setIsListening(false);
        console.log('✅ Speech recognition stopped');
      } catch (err) {
        console.error('❌ Failed to stop recognition:', err);
        setIsListening(false);
      }
    }
  };

  const parseWithAI = async () => {
    // Stop listening if still recording
    if (isListening) {
      stopListening();
    }

    if (!transcript.trim()) {
      setError('Please record some speech first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('🎤 Sending voice transcript to AI for doctor parsing:', transcript);
      
      const response = await apiService.parseVoiceDoctor(transcript, user.user_id);
      
      console.log('✅ AI parsed doctor data:', response);
      console.log('📋 Parsed data object:', response.parsed_data);

      if (response.success && response.parsed_data) {
        console.log('✅ Setting parsed data - Name:', response.parsed_data.name, 'Specialization:', response.parsed_data.specialization);
        setParsedData(response.parsed_data);
      } else {
        setError(response.message || 'Failed to parse doctor information from speech');
      }
    } catch (err) {
      console.error('❌ Error parsing voice input:', err);
      setError('Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;

    try {
      setIsProcessing(true);
      
      console.log('💾 Saving doctor with data:', parsedData);

      // Save doctor to database - map fields to match backend expectations
      const doctorData = {
        name: parsedData.name,
        specialization: parsedData.specialization,
        contact_number: parsedData.phone || parsedData.contact_number, // Backend expects contact_number
        email: parsedData.email
        // Note: Backend doesn't support address and notes fields yet
      };

      console.log('📤 Sending doctor data to backend:', doctorData);

      const response = await apiService.addDoctor(doctorData);
      console.log('✅ Doctor saved successfully:', response);

      onSuccess('Doctor added successfully via voice!');
      onClose();
    } catch (err) {
      console.error('❌ Error saving doctor:', err);
      setError(`Failed to save doctor: ${err.message || 'Please try again.'}`);
      setIsProcessing(false);
    }
  };

  const updateParsedData = (field, value) => {
    setParsedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="voice-modal-overlay" onClick={onClose}>
      <div className="voice-modal-content" onClick={e => e.stopPropagation()}>
        <div className="voice-modal-header">
          <h2>🎤 Voice Add Doctor</h2>
          <button className="voice-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="voice-modal-body">
          {/* Voice Input Section */}
          <div className="voice-input-section">
            <div className="voice-instructions">
              Click the button and speak naturally. For example:
              <em>
                "Dr. Sarah Johnson, cardiologist, phone 555-0123, email sarah@hospital.com, 
                123 Medical Plaza, specializes in heart conditions"
              </em>
            </div>

            <button
              className={`voice-record-btn ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
            >
              {isListening && <span className="pulse-dot"></span>}
              {isListening ? 'Listening...' : 'Click to Start'}
            </button>

            {transcript && (
              <div className="voice-transcript">
                <h4>Transcript:</h4>
                <p>{transcript}</p>
                <button
                  className="voice-parse-btn"
                  onClick={parseWithAI}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="voice-spinner"></span>
                      Processing with AI...
                    </>
                  ) : (
                    <>🤖 Parse with AI</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="voice-error">
              ⚠️ {error}
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData && (
            <div className="voice-parsed-data">
              <h4>📋 Parsed Doctor Information</h4>
              <p className="confidence-note">
                Review and edit the information below before saving:
              </p>

              <div className="voice-form-group">
                <label>Doctor Name *</label>
                <input
                  type="text"
                  value={parsedData.name || ''}
                  onChange={(e) => updateParsedData('name', e.target.value)}
                  placeholder="Dr. Name"
                />
              </div>

              <div className="voice-form-group">
                <label>Specialization *</label>
                <input
                  type="text"
                  value={parsedData.specialization || ''}
                  onChange={(e) => updateParsedData('specialization', e.target.value)}
                  placeholder="e.g., Cardiologist"
                />
              </div>

              <div className="voice-form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={parsedData.phone || ''}
                  onChange={(e) => updateParsedData('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>

              <div className="voice-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={parsedData.email || ''}
                  onChange={(e) => updateParsedData('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="voice-form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={parsedData.address || ''}
                  onChange={(e) => updateParsedData('address', e.target.value)}
                  placeholder="Clinic/Hospital address"
                />
              </div>

              <div className="voice-form-group">
                <label>Notes</label>
                <textarea
                  value={parsedData.notes || ''}
                  onChange={(e) => updateParsedData('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows="3"
                />
              </div>

              <div className="voice-action-buttons">
                <button
                  className="voice-save-btn"
                  onClick={() => {
                    console.log('🔘 Save button clicked!');
                    console.log('📋 Current parsedData:', parsedData);
                    console.log('✅ Name:', parsedData?.name, 'Specialization:', parsedData?.specialization);
                    console.log('🚫 Is disabled?', isProcessing || !parsedData?.name || !parsedData?.specialization);
                    handleSave();
                  }}
                  disabled={isProcessing || !parsedData?.name || !parsedData?.specialization}
                >
                  {isProcessing ? (
                    <>
                      <span className="voice-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>💾 Save Doctor</>
                  )}
                </button>
                <button
                  className="voice-cancel-btn"
                  onClick={() => {
                    setParsedData(null);
                    setTranscript('');
                  }}
                  disabled={isProcessing}
                >
                  ↺ Start Over
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Tips */}
        <div className="voice-modal-footer">
          <div className="voice-tip">
            💡 <strong>Tip:</strong> Speak clearly and include doctor name, specialization, and contact details
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAddDoctorModal;
