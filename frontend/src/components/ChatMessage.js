import React from 'react';
import './ChatMessage.css';

function ChatMessage({ message, type, timestamp }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`chat-message ${type}`}>
      <div className="message-avatar">
        {type === 'user' ? '👤' : '🤖'}
      </div>
      <div>
        <div className="message-content">
          {message}
        </div>
        <div className="message-timestamp">
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
