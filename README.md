# LifeTrack - Personal Health Record Management System

A modern, AI-powered web application for managing personal health records, built with React and Python Flask.

## 🌟 Features

### Core Features
- **🤖 AI Health Insights**: Powered by Google Gemini 2.5 - Get personalized health analysis, trends, and recommendations
- **🎤 Voice-to-Text Entry**: Speak naturally to add health records and doctors - AI automatically extracts and structures data
- **✏️ Full CRUD Operations**: Create, Read, Update, and Delete for all records, doctors, and treatments
- **🌓 Light/Dark Theme**: Beautiful dual theme system with smooth transitions and persistent user preference
- **📱 Mobile-First Design**: Fully responsive interface optimized for phones and tablets
- **👨‍⚕️ Doctor Management**: Store, edit, and manage your healthcare providers
- **📋 Medical Records**: Track, edit, and search your medical history, appointments, and test results  
- **💊 Treatment Tracking**: Monitor, update, and manage medications, treatments, and prescriptions
- **🔐 Secure Authentication**: User login and session management
- **📊 Dashboard**: Interactive overview of your health data with statistics
- **📱 Mobile App**: Android APK available via Capacitor

### AI-Powered Features
- **Smart Health Analysis**: Multi-model fallback system (Gemini 2.0 Flash Exp, 2.0 Flash, 1.5 Flash, 1.5 Pro)
- **Voice-to-Record**: Speak your health information naturally, AI parses and categorizes automatically
- **Voice-to-Doctor**: Add new doctors by speaking their details
- **Intelligent Data Extraction**: AI separates medication names from dosages, identifies doctors, diagnoses, and dates
- **Fallback Parser**: Regex-based extraction ensures data is captured even if AI is unavailable

## 🚀 Tech Stack

### Frontend
- **React 18.2.0** - Modern UI framework
- **React Router** - Client-side routing
- **CSS Grid & Flexbox** - Responsive layouts
- **Capacitor 7.4.3** - Mobile app development

### Backend
- **Python Flask** - RESTful API server
- **SQLite** - Lightweight database
- **Flask-CORS** - Cross-origin resource sharing
- **Google Gemini AI** - AI-powered health insights and analysis

### Mobile
- **Capacitor** - Cross-platform mobile app framework
- **Android Studio** - Android development environment

## 📁 Project Structure

```
lifetrack/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── data_structures.py     # Database models
│   ├── phr_database.db        # SQLite database
│   ├── phr_database.sql       # Database schema
│   ├── reset_db.py           # Database reset utility
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/        # React components (Modals, Navbar, ThemeToggle)
│   │   ├── context/          # React Context (ThemeContext)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── modern-ui.css     # Main styling (dark theme)
│   │   └── light-theme.css   # Light theme styling
│   ├── android/              # Capacitor Android project
│   ├── public/               # Static assets
│   └── package.json          # Node.js dependencies
├── DEPLOYMENT.md             # Deployment instructions
├── MOBILE_BUILD_INSTRUCTIONS.md # Mobile build guide
├── FEATURES.md               # Detailed feature documentation
├── CHANGELOG.md              # Version history
└── README.md                 # This file
```

## 🛠️ Installation

### Prerequisites
- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **Git**

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/lifetrack.git
   cd lifetrack/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Add your Google Gemini API key:
   # GEMINI_API_KEY=your_api_key_here
   ```

   Get your free API key from: https://makersuite.google.com/app/apikey

5. **Initialize database:**
   ```bash
   python app.py
   ```
   The database will be created automatically on first run.

6. **Reset database (optional):**
   ```bash
   python reset_db.py
   ```
   This will reset the database to initial state with sample data.

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

## 🖥️ Usage

### Development Mode

1. **Start the backend server:**
   ```bash
   cd backend
   python app.py
   ```
   Server runs on `http://localhost:5000`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm start
   ```
   App runs on `http://localhost:3000`

### Production Build

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy using the production build** (see `DEPLOYMENT.md` for details)

## 📱 Mobile App

### Building Android APK

1. **Build the React app:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync android
   ```

3. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

4. **APK Location:**
   ```
   frontend/android/app/build/outputs/apk/debug/app-debug.apk
   ```

For detailed mobile build instructions, see `MOBILE_BUILD_INSTRUCTIONS.md`.

## 🤖 AI Features

### Google Gemini Integration

LifeTrack uses Google's Gemini AI to provide intelligent health insights and voice-powered data entry:

#### AI Health Insights
- **Personalized Health Summary**: AI analyzes your complete medical history
- **Trend Detection**: Identifies patterns in doctor visits, treatments, and diagnoses
- **Smart Recommendations**: Actionable health advice based on your records
- **Statistics Dashboard**: Visual display of health metrics and activity
- **Multi-Model Fallback**: Automatically tries Gemini 2.0 Flash Exp → 2.0 Flash → 1.5 Flash → 1.5 Pro

#### Voice-to-Text Features
- **Voice-to-Record**: Speak naturally about your health - AI extracts doctor, diagnosis, date, medication, and dosage
- **Voice-to-Doctor**: Add new doctors by speaking their name, specialization, contact info
- **Smart Parsing**: AI separates medication names from dosages, identifies dates and doctors
- **Fallback Parser**: Regex-based extraction ensures data capture even without AI
- **Real-time Transcription**: See your speech converted to text in real-time
- **Editable Preview**: Review and edit AI-extracted data before saving

#### How to Use Voice Features
1. Click "🎤 Voice Record" or "🎤 Voice Doctor" button
2. Click "Start Listening" and speak naturally
3. AI transcribes and parses your speech automatically
4. Review the extracted information
5. Edit if needed and click "Save"
- **Real-time Analysis**: Get updated insights with a single click

### How It Works

1. User health data (records, treatments, doctor visits) is securely sent to the backend
2. Backend formats data into a structured prompt for Gemini AI
3. Gemini analyzes patterns, trends, and generates personalized insights
4. Results are displayed in a beautiful glassmorphic UI component
5. Users can refresh insights anytime to get updated analysis

### AI Models Used

- **Primary**: Gemini 2.5 Flash (Fast, efficient, 1M token context)
- **Backup**: Gemini 2.0 Flash (Alternative stable version)
- **Premium**: Gemini 2.5 Pro (Most capable, deeper analysis)

## 🎨 UI/UX Features

- **Dual Theme System**: 
  - 🌙 **Dark Theme**: Cyan (#00d4ff) accents with dark glassmorphism
  - ☀️ **Light Theme**: Apple Blue (#007aff) accents with light, airy design
  - Smooth 0.3s transitions between themes
  - Persistent theme preference saved to localStorage
  - Toggle button in navbar for easy switching
- **Glassmorphism Design**: Modern frosted glass effect with backdrop blur
- **Gradient Animations**: Smooth color transitions and animated backgrounds
- **Mobile-Optimized Navbar**: Three-column grid layout with responsive design
- **Safe Area Support**: Compatible with modern phone screens (notch/island support)
- **Responsive Breakpoints**: Optimized for all screen sizes from mobile to desktop
- **Touch-Friendly**: Large tap targets (44px minimum) for mobile interaction
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🌓 Theme System

LifeTrack features a beautiful dual theme system that adapts to your preference:

### Dark Theme (Default)
- **Background**: Deep black gradients (#0a0a0a)
- **Accent Color**: Cyan (#00d4ff)
- **Design**: Futuristic glassmorphism with glowing effects
- **Perfect for**: Night-time use, reduced eye strain

### Light Theme
- **Background**: Clean white with subtle grays (#ffffff, #f5f5f7)
- **Accent Color**: Apple Blue (#007aff)
- **Design**: Minimal, airy interface inspired by Apple's design language
- **Perfect for**: Daytime use, professional settings

### Features
- **One-Click Toggle**: Sun/moon icon in navbar
- **Smooth Transitions**: 0.3s animation between themes
- **Persistent Storage**: Your choice is saved across sessions
- **System-Wide**: Applies to all pages and components
- **Optimized Contrast**: Text visibility optimized for both themes

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Doctors
- `GET /doctors` - Get all doctors
- `POST /doctors` - Add new doctor
- `PUT /doctors/<id>` - Update doctor
- `DELETE /doctors/<id>` - Delete doctor (cascades to records and treatments)

### Health Records
- `GET /health_records` - Get all medical records
- `POST /health_records` - Add new record
- `PUT /health_records/<id>` - Update record
- `DELETE /health_records/<id>` - Delete record

### Treatments
- `GET /treatment` - Get all treatments
- `POST /treatment` - Add new treatment
- `PUT /treatment/<id>` - Update treatment
- `DELETE /treatment/<id>` - Delete treatment

### AI Features
- `GET /api/health-insights/<user_id>` - Get AI-powered health insights and recommendations
- `POST /api/parse-voice-record` - Parse voice input to extract health record data
- `POST /api/parse-voice-doctor` - Parse voice input to extract doctor information

## 🚀 Local Development

This application is configured to run on localhost:

### Backend
- Runs on `http://localhost:5000`
- SQLite database stored locally

### Frontend
- Runs on `http://localhost:3000`
- Automatically connects to local backend

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. **Check the documentation** in `DEPLOYMENT.md` and `MOBILE_BUILD_INSTRUCTIONS.md`
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information

## 📈 Roadmap

- [x] **AI Health Insights** - Powered by Google Gemini ✅
- [x] **Voice-to-Text Entry** - Natural speech input for records and doctors ✅
- [x] **Full CRUD Operations** - Complete edit/delete functionality ✅
- [x] **Light/Dark Theme** - Beautiful dual theme system ✅
- [ ] **iOS app support** - Extend mobile app to iOS platform
- [ ] **Data export/import** - Backup and restore health records (JSON/CSV)
- [ ] **Appointment scheduling** - Calendar integration with reminders
- [ ] **Medication reminders** - Push notifications with AI-powered suggestions
- [ ] **Health metrics tracking** - Charts and graphs with trend analysis
- [ ] **PDF report generation** - Downloadable health summaries
- [ ] **Multi-language support** - Internationalization (i18n)
- [ ] **AI-powered symptom checker** - Interactive health assessment
- [ ] **Medical document OCR** - Auto-extract data from prescription images
- [ ] **Family account sharing** - Manage health records for dependents
- [ ] **Doctor appointment booking** - Integration with healthcare providers
- [ ] PDF report generation
- [ ] Multi-language support
- [ ] AI-powered symptom checker
- [ ] Medical document OCR and auto-extraction

## ⭐ Acknowledgments

- React team for the amazing framework
- Flask community for the lightweight backend solution
- Capacitor team for seamless mobile development
- Contributors and testers

---

**Made with ❤️ for better health management**
