import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const APITest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      console.log('🧪 Running API Tests...');
      const results = {};

      // Test 1: Basic connection
      try {
        const response = await fetch('http://localhost:5000');
        const data = await response.json();
        results.basicConnection = { success: true, data };
        console.log('✅ Basic connection:', data);
      } catch (error) {
        results.basicConnection = { success: false, error: error.message };
        console.log('❌ Basic connection failed:', error);
      }

      // Test 2: Users endpoint
      try {
        const users = await apiService.getUsers();
        results.users = { success: true, count: users.length };
        console.log('✅ Users endpoint:', users.length, 'users');
      } catch (error) {
        results.users = { success: false, error: error.message };
        console.log('❌ Users endpoint failed:', error);
      }

      // Test 3: Health records endpoint
      try {
        const records = await apiService.getHealthRecords();
        results.healthRecords = { success: true, count: records.length };
        console.log('✅ Health records endpoint:', records.length, 'records');
      } catch (error) {
        results.healthRecords = { success: false, error: error.message };
        console.log('❌ Health records endpoint failed:', error);
      }

      // Test 4: Login test
      try {
        const user = await apiService.login('raj@example.com', '1234');
        results.login = { success: true, user: user.name };
        console.log('✅ Login test:', user.name);
      } catch (error) {
        results.login = { success: false, error: error.message };
        console.log('❌ Login test failed:', error);
      }

      setTestResults(results);
      setLoading(false);
    };

    runTests();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Running API Tests...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 API Connection Tests</h2>
      
      {Object.entries(testResults).map(([test, result]) => (
        <div key={test} style={{ 
          margin: '10px 0', 
          padding: '10px', 
          border: `2px solid ${result.success ? 'green' : 'red'}`,
          borderRadius: '5px'
        }}>
          <h3>{result.success ? '✅' : '❌'} {test}</h3>
          {result.success ? (
            <div>
              {result.data && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
              {result.count !== undefined && <p>Count: {result.count}</p>}
              {result.user && <p>User: {result.user}</p>}
            </div>
          ) : (
            <p style={{ color: 'red' }}>Error: {result.error}</p>
          )}
        </div>
      ))}
      
      <div style={{ marginTop: '20px' }}>
        <p>Check the browser console for detailed logs!</p>
      </div>
    </div>
  );
};

export default APITest;