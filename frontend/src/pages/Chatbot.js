import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatMessage from '../components/ChatMessage';
import { apiService } from '../services/api';
import './Chatbot.css';

function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const messagesEndRef = useRef(null);

  console.log('🤖 Chatbot component rendering');

  useEffect(() => {
    console.log('🤖 Chatbot useEffect triggered');
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    console.log('🤖 User from localStorage:', userStr);
    
    if (!userStr) {
      console.log('❌ No user in localStorage, redirecting to login');
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('✅ Parsed user:', user);
      
      if (!user || !user.user_id) {
        console.log('❌ Invalid user data, redirecting to login');
        navigate('/login');
        return;
      }
      setUserData(user);
      console.log('✅ User data set successfully');

      // Add welcome message
      setMessages([
        {
          id: 1,
          message: `Hello ${user.name}! 👋 I'm your LifeTrack Health Assistant. I can help you understand your medical history, treatments, and appointments. What would you like to know?`,
          type: 'bot',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      message: inputMessage,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiService.chatbotQuery(userData.user_id, inputMessage);
      
      const botMessage = {
        id: messages.length + 2,
        message: response.response,
        type: 'bot',
        timestamp: new Date(),
        metadata: {
          records_count: response.records_count,
          treatments_count: response.treatments_count,
          doctors_count: response.doctors_count,
          fallback: response.fallback
        }
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: messages.length + 2,
        message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        type: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const suggestions = [
    "What are my recent diagnoses?",
    "Show me my current medications",
    "When is my next follow-up?",
    "What conditions have I been treated for?",
    "Who are my healthcare providers?"
  ];

  return (
    <div>
      <Navbar />
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h1>
            <span>🤖</span>
            Health Assistant
          </h1>
          <p>Ask me anything about your medical history and health records</p>
        </div>

        <div className="chat-window">
          <div className="chat-messages">
            {messages.length === 1 && (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <h3>Start a Conversation</h3>
                <p>Try asking me about your medical history, treatments, or upcoming appointments</p>
                <div className="suggestion-chips">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.message}
                type={msg.type}
                timestamp={msg.timestamp}
              />
            ))}

            {isLoading && (
              <div className="chat-message bot">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            {userData && messages.length > 1 && (
              <div className="chat-info">
                <div className="info-item">
                  <span>📋</span>
                  <span>Patient: <strong>{userData.name}</strong></span>
                </div>
              </div>
            )}
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="Type your question here..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                <span>{isLoading ? 'Sending...' : 'Send'}</span>
                <span>📤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
