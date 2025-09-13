# LifeTrack - Personal Health Record Management System

A modern, responsive web application for managing personal health records, built with React and Python Flask.

## 🌟 Features

- **📱 Mobile-First Design**: Fully responsive interface optimized for phones and tablets
- **👨‍⚕️ Doctor Management**: Store and manage your healthcare providers
- **📋 Medical Records**: Track your medical history, appointments, and test results  
- **💊 Treatment Tracking**: Monitor medications, treatments, and prescriptions
- **🔐 Secure Authentication**: User login and session management
- **📊 Dashboard**: Overview of your health data at a glance
- **📱 Mobile App**: Android APK available via Capacitor

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
│   ├── requirements.txt       # Python dependencies
│   └── Procfile              # Deployment configuration
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── modern-ui.css     # Styling
│   ├── android/              # Capacitor Android project
│   ├── public/               # Static assets
│   └── package.json          # Node.js dependencies
├── DEPLOYMENT.md             # Deployment instructions
├── MOBILE_BUILD_INSTRUCTIONS.md # Mobile build guide
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

4. **Initialize database:**
   ```bash
   python app.py
   ```

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

## 🎨 UI/UX Features

- **Glassmorphism Design**: Modern frosted glass effect
- **Gradient Animations**: Smooth color transitions
- **Mobile-Optimized Navbar**: Three-column grid layout
- **Safe Area Support**: Compatible with modern phone screens
- **Responsive Breakpoints**: Optimized for all screen sizes
- **Touch-Friendly**: Large tap targets for mobile interaction

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Add new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Records
- `GET /api/records` - Get all medical records
- `POST /api/records` - Add new record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record

### Treatments
- `GET /api/treatments` - Get all treatments
- `POST /api/treatments` - Add new treatment
- `PUT /api/treatments/:id` - Update treatment
- `DELETE /api/treatments/:id` - Delete treatment

## 🚀 Deployment

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

### Manual Deployment
See `DEPLOYMENT.md` for detailed deployment instructions.

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

- [ ] iOS app support
- [ ] Data export/import
- [ ] Appointment scheduling
- [ ] Medication reminders
- [ ] Health metrics tracking
- [ ] PDF report generation
- [ ] Multi-language support

## ⭐ Acknowledgments

- React team for the amazing framework
- Flask community for the lightweight backend solution
- Capacitor team for seamless mobile development
- Contributors and testers

---

**Made with ❤️ for better health management**
