# LifeTrack Chatbot - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Get Hugging Face API Key (2 minutes)

1. Go to [https://huggingface.co](https://huggingface.co)
2. Sign up for a free account (or log in)
3. Navigate to: **Settings** → **Access Tokens**
4. Click **"New token"**
5. Name it: `lifetrack-chatbot`
6. Select permissions: **Read**
7. Click **"Generate"**
8. **Copy the token** (you won't see it again!)

### Step 2: Configure Backend (1 minute)

1. Open your terminal in the `backend` folder
2. Create a `.env` file:
   ```bash
   # Windows
   echo HUGGINGFACE_API_KEY=your_token_here > .env
   
   # Mac/Linux
   echo "HUGGINGFACE_API_KEY=your_token_here" > .env
   ```
3. Replace `your_token_here` with your actual token

**OR** manually create `.env` file with this content:
```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Install Dependencies (1 minute)

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- Flask-CORS (cross-origin requests)
- requests (HTTP library)
- python-dotenv (environment variables)
- huggingface-hub (AI integration) ← NEW!

### Step 4: Start the Application (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm start
```

### Step 5: Use the Chatbot! 🎉

1. Open browser: `http://localhost:3000`
2. Log in with test credentials:
   - Email: `raj@example.com`
   - Password: `1234`
3. Click **"🤖 Chatbot"** in the navigation bar
4. Start asking questions!

## 💬 Example Conversations

### Question 1: "What are my recent diagnoses?"
**Chatbot Response:**
> Based on your medical records, your most recent diagnosis is Hypertension from June 10, 2025. This was diagnosed by Dr. Smith, a Cardiologist. You should continue taking Amlodipine as prescribed.

### Question 2: "Show me my current medications"
**Chatbot Response:**
> You are currently taking Amlodipine, which was prescribed for your Hypertension. The recommended dosage is 1 tablet after breakfast. Your next follow-up for this medication is scheduled for June 24, 2025.

### Question 3: "When is my next follow-up?"
**Chatbot Response:**
> Your next scheduled follow-up appointment is on June 24, 2025, related to your Hypertension treatment with Amlodipine.

## 🛠️ Troubleshooting

### Problem: "API Key Invalid"
**Solution:**
- Check `.env` file in `backend` folder
- Ensure no spaces around the `=` sign
- Verify the key starts with `hf_`
- Make sure you copied the entire token

### Problem: "All Models Failed"
**Solution:**
- Check your internet connection
- Verify API key is valid
- Wait a minute and try again (rate limiting)
- Check Hugging Face status: [https://status.huggingface.co](https://status.huggingface.co)

### Problem: "User Not Found"
**Solution:**
- Make sure you're logged in
- Use test credentials: `raj@example.com` / `1234`
- Try logging out and back in

### Problem: Backend Not Connecting
**Solution:**
```bash
# Reset the database
cd backend
python reset_db.py

# Restart the backend
python app.py
```

## 🎯 Features Overview

### What the Chatbot CAN Do:
✅ Answer questions about your diagnoses
✅ List your medications and treatments
✅ Show upcoming appointments
✅ Provide information about your doctors
✅ Summarize your medical history
✅ Reference specific dates and details

### What the Chatbot CANNOT Do:
❌ Provide medical advice or diagnoses
❌ Replace your doctor's recommendations
❌ Prescribe medications
❌ Access other users' data
❌ Store conversation history (for privacy)

## 🔐 Privacy & Security

- **Your data stays local** - SQLite database on your computer
- **Conversations are NOT saved** - Privacy by design
- **User-specific access** - Only sees YOUR medical records
- **API key is private** - Never share your `.env` file
- **No data sharing** - Hugging Face processes queries but doesn't store them

## 📊 Rate Limits (Free Tier)

**Hugging Face Free Account:**
- ~1,000 requests per day
- Rate limited by IP address
- Sufficient for personal use
- Upgrade available for heavy usage

## 🆙 Upgrade (Optional)

For production or heavy usage:
1. Go to [Hugging Face Pricing](https://huggingface.co/pricing)
2. Choose a paid plan
3. Get higher rate limits and priority access
4. Use the same API key (no code changes needed)

## 📚 Additional Resources

- **Full Documentation**: See `CHATBOT_DOCUMENTATION.md`
- **Main README**: See `README.md`
- **API Reference**: Check `backend/app.py` endpoint comments
- **Frontend Code**: `frontend/src/pages/Chatbot.js`

## 💡 Pro Tips

1. **Ask specific questions** - "What medication for hypertension?" vs "Tell me about meds"
2. **Use natural language** - The AI understands conversational queries
3. **Reference dates** - "What happened in June 2025?"
4. **Check details** - "Who is Dr. Smith?" or "What's his phone number?"

## 🆘 Still Having Issues?

1. Check console logs (F12 in browser)
2. Review backend terminal output
3. Verify all environment variables are set
4. Ensure both servers are running
5. Try restarting both backend and frontend

---

**Ready to go? Start chatting with your health assistant! 🤖💚**
