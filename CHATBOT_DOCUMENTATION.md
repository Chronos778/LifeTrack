# LifeTrack Chatbot Feature

## Overview
The LifeTrack Chatbot is an AI-powered health assistant that answers patient questions based on their personal medical data stored in the database. It uses the Hugging Face Inference API to provide intelligent, context-aware responses.

## Features

### 🤖 Intelligent Query Processing
- **Personalized Responses**: Answers based on the user's actual medical history
- **Context-Aware**: References diagnoses, treatments, doctors, and appointments
- **Natural Language**: Understands questions in conversational format
- **Medical Data Integration**: Pulls from health records, treatments, and doctor information

### 💬 User Interface
- **Modern Chat Interface**: Clean, intuitive design with message bubbles
- **Suggested Questions**: Quick-start prompts for common queries
- **Real-time Responses**: Live typing indicators and smooth animations
- **Dark Mode Support**: Seamless theme integration

### 🔒 Privacy & Security
- **User-Specific Data**: Only accesses the logged-in user's medical records
- **No External Storage**: Conversations are not stored permanently
- **Secure API**: Protected endpoints requiring user authentication

## Technical Implementation

### Backend (Flask)
**Endpoint**: `POST /chatbot/query`

**Request Body**:
```json
{
  "user_id": 1,
  "question": "What are my recent diagnoses?"
}
```

**Response**:
```json
{
  "success": true,
  "response": "Based on your records, you have been diagnosed with...",
  "records_count": 5,
  "treatments_count": 3,
  "doctors_count": 2
}
```

### Frontend (React)
- **Component**: `Chatbot.js` - Main chatbot page
- **Sub-component**: `ChatMessage.js` - Individual message display
- **Styling**: `Chatbot.css` and `ChatMessage.css`
- **API Service**: Added `chatbotQuery()` method to `api.js`

### AI Integration
Uses **Hugging Face Inference API** with multiple model fallbacks:
1. `mistralai/Mistral-7B-Instruct-v0.2` (Primary)
2. `meta-llama/Llama-3.2-3B-Instruct` (Fallback 1)
3. `HuggingFaceH4/zephyr-7b-beta` (Fallback 2)

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Hugging Face API
Create or update `.env` file in the `backend` directory:
```env
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

**Get Your API Key**:
1. Go to [Hugging Face](https://huggingface.co)
2. Sign up or log in
3. Navigate to Settings → Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token to your `.env` file

### 3. Run the Application
```bash
# Backend
cd backend
python app.py

# Frontend (in separate terminal)
cd frontend
npm start
```

### 4. Access the Chatbot
1. Log in to LifeTrack
2. Click the "🤖 Chatbot" link in the navigation
3. Start asking questions about your health records!

## Example Questions

### Medical History
- "What are my recent diagnoses?"
- "Show me my medical history"
- "What conditions have I been treated for?"

### Medications
- "What medications am I currently taking?"
- "List my current treatments"
- "What is my medication for hypertension?"

### Appointments & Follow-ups
- "When is my next follow-up appointment?"
- "Do I have any upcoming doctor visits?"
- "When was my last checkup?"

### Doctors
- "Who are my healthcare providers?"
- "Which doctors have I consulted?"
- "What is Dr. Smith's specialization?"

## Architecture

```
User Question
     ↓
Frontend (Chatbot.js)
     ↓
API Service (chatbotQuery)
     ↓
Backend (/chatbot/query)
     ↓
Database Query (user's medical data)
     ↓
Context Building (user profile + medical history)
     ↓
Hugging Face API (AI processing)
     ↓
Response Formatting
     ↓
Frontend Display
```

## Data Flow

1. **User Authentication**: Verified user_id from session
2. **Data Retrieval**: Fetch health records, treatments, doctors from SQLite
3. **Context Creation**: Build comprehensive medical profile
4. **AI Query**: Send question + context to Hugging Face API
5. **Response Processing**: Parse and format AI response
6. **Display**: Show response in chat interface

## Error Handling

### Fallback Mechanisms
- **Model Fallback**: Tries 3 different AI models
- **Generic Response**: Returns helpful message if all models fail
- **User Feedback**: Clear error messages for connectivity issues

### Timeout Protection
- **API Timeout**: 30 seconds per request
- **Retry Logic**: Automatic retry with different models
- **User Notification**: Loading indicators and status updates

## Customization

### Adjust AI Parameters
In `backend/app.py`, modify the chatbot payload:
```python
payload = {
    "model": HUGGINGFACE_MODELS[0],
    "messages": [...],
    "max_tokens": 500,      # Increase for longer responses
    "temperature": 0.7      # 0.0-1.0 (lower = more focused)
}
```

### Change Suggested Questions
In `frontend/src/pages/Chatbot.js`:
```javascript
const suggestions = [
  "Your custom question 1",
  "Your custom question 2",
  // Add more...
];
```

## Troubleshooting

### "API Key Invalid"
- Verify your Hugging Face API key in `.env`
- Ensure the token has proper permissions
- Check for extra spaces or quotes

### "All Models Failed"
- Check your internet connection
- Verify Hugging Face API status
- Ensure you haven't exceeded rate limits

### "User Not Found"
- Confirm user is logged in
- Check localStorage for user session
- Verify user_id exists in database

## Future Enhancements

- [ ] **Conversation History**: Save chat sessions to database
- [ ] **Voice Input**: Add speech-to-text for questions
- [ ] **Multi-language Support**: Translate responses
- [ ] **Advanced Analytics**: Generate health insights from conversations
- [ ] **Image Analysis**: Upload and discuss medical images
- [ ] **Appointment Scheduling**: Book appointments through chat

## Security Considerations

⚠️ **Important Reminders**:
- Never commit `.env` file with API keys
- Use environment variables for sensitive data
- Implement rate limiting for production
- Add user authentication middleware
- Sanitize all user inputs
- Log chatbot interactions for compliance

## API Rate Limits

**Hugging Face Free Tier**:
- ~1000 requests/day
- Rate limited per IP
- Consider upgrading for production use

## Support

For issues or questions:
1. Check the console logs (F12 in browser)
2. Review backend terminal output
3. Verify database connectivity
4. Test API endpoint directly with Postman

## License
This feature is part of the LifeTrack project and follows the same license.

---

**Built with ❤️ using Flask, React, and Hugging Face AI**
