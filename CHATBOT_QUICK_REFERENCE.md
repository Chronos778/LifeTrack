# 🤖 LifeTrack Chatbot - Quick Reference

## 🚀 Setup in 3 Steps

1. **Get API Key**: https://huggingface.co/settings/tokens (Free!)
2. **Configure**: Create `backend/.env` → Add `HUGGINGFACE_API_KEY=your_key`
3. **Install**: `pip install -r requirements.txt`

## ▶️ Start Application

```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 💬 Access Chatbot

1. Login: `raj@example.com` / `1234`
2. Click: **🤖 Chatbot** in navbar
3. Ask questions!

## 📝 Example Questions

```
✅ "What are my recent diagnoses?"
✅ "Show me my current medications"
✅ "When is my next follow-up?"
✅ "Who are my healthcare providers?"
✅ "What medications am I taking for hypertension?"
✅ "List all my treatments"
```

## 📁 New Files

```
Backend:
✅ app.py (endpoint added)
✅ requirements.txt (updated)

Frontend:
✅ src/pages/Chatbot.js
✅ src/pages/Chatbot.css
✅ src/components/ChatMessage.js
✅ src/components/ChatMessage.css
✅ src/services/api.js (updated)
✅ src/App.js (route added)
✅ src/components/Navbar.js (link added)

Docs:
✅ CHATBOT_DOCUMENTATION.md
✅ CHATBOT_SETUP.md
✅ CHATBOT_IMPLEMENTATION_SUMMARY.md
✅ README.md (updated)
```

## 🔧 API Endpoint

```javascript
POST /chatbot/query
{
  "user_id": 1,
  "question": "What are my medications?"
}

Response:
{
  "success": true,
  "response": "Based on your records...",
  "records_count": 5,
  "treatments_count": 3
}
```

## 🎨 Features

✅ Natural language queries
✅ Context-aware responses
✅ Medical data integration
✅ Suggested questions
✅ Dark/light theme support
✅ Mobile responsive
✅ Typing indicator
✅ Error handling

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| API Key Invalid | Check `.env` file, verify key starts with `hf_` |
| Models Failed | Check internet, verify API key, try again |
| User Not Found | Make sure you're logged in |
| Backend Error | Restart: `python app.py` |

## 📚 Full Documentation

- **Setup Guide**: `CHATBOT_SETUP.md`
- **Full Docs**: `CHATBOT_DOCUMENTATION.md`
- **Implementation**: `CHATBOT_IMPLEMENTATION_SUMMARY.md`

## 🔐 Privacy

- ✅ User-specific data only
- ✅ No conversation storage
- ✅ Local database
- ✅ Secure API

## 🎯 Tech Stack

- **Backend**: Flask + Hugging Face API
- **Frontend**: React + Modern UI
- **AI Models**: Mistral-7B, Llama-3.2, Zephyr-7B
- **Database**: SQLite

---

**Ready to chat? Start asking about your health! 💚**
