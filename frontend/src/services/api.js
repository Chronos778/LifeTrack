import axios from 'axios';

// Environment-based API configuration
// Force localhost for development - use environment variable to override
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Test connection on startup
api.get('/')
  .then(response => console.log('✅ Backend connection successful:', response.data))
  .catch(error => console.error('❌ Backend connection failed:', error.message));

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', {
      url: response.config?.url,
      method: response.config?.method,
      status: response.status,
      dataLength: response.data?.length || 'N/A'
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

// API functions to interact with your Flask backend
export const apiService = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(`Failed to fetch users: ${error.response?.data?.message || error.message}`);
    }
  },

  // Get all doctors
  getDoctors: async () => {
    try {
      const response = await api.get('/doctors');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch doctors');
    }
  },

  // Get doctors visited by a specific user
  getDoctorsVisitedByUser: async (userId) => {
    try {
      const [doctors, records] = await Promise.all([
        api.get('/doctors'),
        api.get('/health_records')
      ]);
      
      // Get unique doctor IDs from user's health records
      const userRecords = records.data.filter(record => record.user_id === userId);
      const visitedDoctorIds = [...new Set(userRecords.map(record => record.doctor_id))];
      
      // Filter doctors to only show visited ones
      const visitedDoctors = doctors.data.filter(doctor => 
        visitedDoctorIds.includes(doctor.doctor_id)
      );
      
      return visitedDoctors;
    } catch (error) {
      throw new Error('Failed to fetch visited doctors');
    }
  },

  // Get all health records
  getHealthRecords: async () => {
    try {
      const response = await api.get('/health_records');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch health records');
    }
  },

  // Get health records for a specific user
  getUserHealthRecords: async (userId) => {
    try {
      const response = await api.get('/health_records');
      const userRecords = response.data.filter(record => record.user_id === userId);
      
      // Sort by date (most recent first)
      userRecords.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
      
      return userRecords;
    } catch (error) {
      throw new Error('Failed to fetch user health records');
    }
  },

  // Get all treatments
  getTreatments: async () => {
    try {
      const response = await api.get('/treatment');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch treatments');
    }
  },

  // Get treatments for a specific user
  getUserTreatments: async (userId) => {
    try {
      const [treatments, records] = await Promise.all([
        api.get('/treatment'),
        api.get('/health_records')
      ]);
      
      // Get user's health record IDs
      const userRecords = records.data.filter(record => record.user_id === userId);
      const userRecordIds = userRecords.map(record => record.record_id);
      
      // Filter treatments to only show user's treatments
      const userTreatments = treatments.data.filter(treatment => 
        userRecordIds.includes(treatment.record_id)
      );
      
      return userTreatments;
    } catch (error) {
      throw new Error('Failed to fetch user treatments');
    }
  },

  // Get treatment history with related record info for a user
  getUserTreatmentHistory: async (userId) => {
    try {
      const [treatments, records, doctors] = await Promise.all([
        api.get('/treatment'),
        api.get('/health_records'),
        api.get('/doctors')
      ]);
      
      // Get user's health records
      const userRecords = records.data.filter(record => record.user_id === userId);
      const userRecordIds = userRecords.map(record => record.record_id);
      
      // Get user's treatments with related record info
      const userTreatments = treatments.data
        .filter(treatment => userRecordIds.includes(treatment.record_id))
        .map(treatment => {
          const relatedRecord = userRecords.find(record => record.record_id === treatment.record_id);
          const doctor = doctors.data.find(doc => doc.doctor_id === relatedRecord?.doctor_id);
          
          return {
            ...treatment,
            diagnosis: relatedRecord?.diagnosis,
            record_date: relatedRecord?.record_date,
            doctor_name: doctor?.name || 'Unknown Doctor',
            doctor_specialization: doctor?.specialization
          };
        });
      
      // Sort by record date (most recent first)
      userTreatments.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
      
      return userTreatments;
    } catch (error) {
      throw new Error('Failed to fetch user treatment history');
    }
  },

  // Login function - validates user credentials
  login: async (email, password) => {
    try {
      console.log('🔐 Login attempt:', { email, password: '***' });
      const response = await api.get('/users');
      console.log('✅ Got users response:', response.data);
      
      const user = response.data.find(u => u.email === email && u.password === password);
      console.log('🔍 User found:', user ? 'YES' : 'NO');
      
      if (user) {
        // Don't send password back to frontend
        const { password: _, ...userWithoutPassword } = user;
        console.log('✅ Login successful for:', user.email);
        return userWithoutPassword;
      } else {
        console.error('❌ Invalid credentials');
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      if (error.message === 'Invalid email or password') {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  // POST methods for adding new data
  addHealthRecord: async (recordData) => {
    try {
      const response = await api.post('/health_records', recordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add health record');
    }
  },

  addTreatment: async (treatmentData) => {
    try {
      const response = await api.post('/treatment', treatmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add treatment');
    }
  },

  addDoctor: async (doctorData) => {
    try {
      const response = await api.post('/doctors', doctorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add doctor');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register user');
    }
  },

  // DELETE methods for removing data
  deleteHealthRecord: async (recordId) => {
    try {
      const response = await api.delete(`/health_records/${recordId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete health record');
    }
  },

  deleteTreatment: async (treatmentId) => {
    try {
      const response = await api.delete(`/treatment/${treatmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete treatment');
    }
  },

  deleteDoctor: async (doctorId) => {
    try {
      const response = await api.delete(`/doctors/${doctorId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete doctor');
    }
  },

  // UPDATE methods for editing data
  updateDoctor: async (doctorId, doctorData) => {
    try {
      const response = await api.put(`/doctors/${doctorId}`, doctorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update doctor');
    }
  },

  updateHealthRecord: async (recordId, recordData) => {
    try {
      const response = await api.put(`/health_records/${recordId}`, recordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update health record');
    }
  },

  updateTreatment: async (treatmentId, treatmentData) => {
    try {
      const response = await api.put(`/treatment/${treatmentId}`, treatmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update treatment');
    }
  },

  // AI Health Insights
  getHealthInsights: async (userId) => {
    try {
      console.log('Fetching AI insights for user:', userId);
      const response = await api.get(`/api/health-insights/${userId}`, {
        timeout: 60000  // 60 seconds for AI processing
      });
      console.log('AI insights response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching health insights:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch health insights');
    }
  },

  // Voice-to-Record: Parse voice input with AI
  parseVoiceRecord: async (text, userId) => {
    try {
      const response = await api.post('/api/parse-voice-record', {
        text: text,
        user_id: userId
      }, {
        timeout: 30000  // 30 seconds for AI parsing
      });
      return response.data;
    } catch (error) {
      console.error('Error parsing voice record:', error);
      throw new Error(error.response?.data?.message || 'Failed to parse voice input');
    }
  },

  // Voice-to-Doctor: Parse voice input for doctor with AI
  parseVoiceDoctor: async (text, userId) => {
    try {
      const response = await api.post('/api/parse-voice-doctor', {
        text: text,
        user_id: userId
      }, {
        timeout: 30000  // 30 seconds for AI parsing
      });
      return response.data;
    } catch (error) {
      console.error('Error parsing voice doctor:', error);
      throw new Error(error.response?.data?.message || 'Failed to parse voice input');
    }
  }
};

export default apiService;
