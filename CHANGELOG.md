## Changelog

All notable changes to **LifeTrack** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2025-11-16

### Changed – AI Provider Migration 🚀

#### Switched to Hugging Face Inference API

- **Migrated from Google Gemini to Hugging Face** for AI-powered features
- More cost-effective and open-source friendly
- Access to multiple state-of-the-art models
- Better model transparency and control

#### New AI Models

- **Primary**: `mistralai/Mistral-7B-Instruct-v0.2` (reliable, powerful)
- **Backup**: `meta-llama/Llama-3.2-3B-Instruct` (fast alternative)
- **Fallback**: `HuggingFaceH4/zephyr-7b-beta` (robust option)

#### Updated API Integration

- Using OpenAI-compatible chat completions endpoint
- Router URL: `https://router.huggingface.co/v1/chat/completions`
- Improved error handling and model fallback
- Increased timeout to **60 seconds** for better reliability

#### Updated Configuration

- Replaced `GEMINI_API_KEY` with `HUGGINGFACE_API_KEY`
- Updated `.env.example` with new API key format
- Removed `google-generativeai` dependency
- Updated `requirements.txt` to use `requests` library
- Added `python-dotenv` for automatic `.env` file loading
- API keys now loaded from environment variables (security best practice)

#### Documentation Updates

- Updated `README.md` with Hugging Face integration details
- Revised `AI_FEATURES.md` with new models and setup instructions
- Updated `REPOSITORY_STATUS.md` with current tech stack
- Modified `FEATURES.md` to reflect new AI provider
- Replaced all references to Google Gemini with Hugging Face

#### Technical Details

- Maintained backward compatibility with existing API endpoints
- Same response format for seamless frontend integration
- No changes required to frontend code
- All AI features continue to work as expected

---

## [2.0.0] - 2025-11-05

### Added – AI-Powered Features 🤖

#### Voice-to-Text System

- **Voice-to-Record Modal**
  - Speak naturally to add health records
  - Real-time speech recognition using Web Speech API
  - AI-powered parsing with Hugging Face AI
  - Extracts doctor, diagnosis, date, medication, and dosage
  - Editable preview before saving
  - Accessible from Home and Records pages

- **Voice-to-Doctor Modal**
  - Add doctors via voice
  - Natural language doctor information entry
  - Extracts name, specialization, phone, email, address
  - Smart parsing with regex fallback
  - Dark glassmorphism UI design

#### AI Health Insights

- Multi-model fallback system (Mistral-7B, Llama-3.2, Zephyr-7B)
- Personalized health analysis and recommendations
- Trend detection and pattern recognition
- Statistics dashboard with health metrics
- 60-second timeout for complex analysis
- Intelligent prompt engineering for medical data

#### Smart Parsing

- Medication name and dosage separation
- Automatic date extraction and formatting
- Doctor matching from existing database
- Confidence scoring for parsed data
- Fallback regex parser for reliability

### Added – Full CRUD Operations ✏️

#### Edit Functionality

- **Edit Doctor Modal**
  - Update doctor information
  - Edit name, specialization, contact, email
  - Form validation and error handling
  - Success notifications

- **Edit Health Record Modal**
  - Modify medical records
  - Edit doctor, diagnosis, date, file path
  - Doctor dropdown selection
  - Styled with glassmorphism design

- **Edit Treatment Modal**
  - Update treatment details
  - Medication, procedure/dosage, follow-up date
  - Textarea for detailed instructions
  - Form validation

#### Delete Functionality

- Cascade delete for doctors (removes related records and treatments)
- Confirmation dialogs before deletion
- Success feedback after deletion
- Proper error handling

### Added – UI/UX Improvements 🎨

#### Styling

- Modern glassmorphism design throughout
- Dark theme for voice modals
- Cyan `#00d9ff` accent color
- Gradient animations and transitions
- Responsive form layouts
- Proper label and input styling with `.neo-input` and `.form-label` classes

#### Components

- Close button styling for all modals
- Alert components with error/success states
- Loading states with spinners
- Empty states with helpful messages
- Statistics cards on dashboard
- Action button grids

#### Mobile Optimization

- 2-column Quick Actions grid on Home page
- Single column on mobile devices
- Touch-friendly targets (44px minimum)
- Safe area inset support
- Improved navbar spacing
- Responsive breakpoints

### Changed – API Enhancements 🔧

#### Backend

- Added `PUT` endpoints for doctors, `health_records`, and `treatments`
- Enhanced error handling with detailed messages
- Improved AI parsing prompts for better accuracy
- Added medication/dosage separation logic
- Added backend logging for debugging
- 30-second timeout for voice parsing

#### Frontend

- Added `updateDoctor`, `updateHealthRecord`, `updateTreatment` API methods
- Enhanced error messages in modals
- Added console logging for debugging
- Improved state management for edit modals

### Fixed – Bug Fixes 🐛

- Fixed duplicate `Dr.` prefix in doctor dropdown
- Fixed speech recognition "already started" errors
- Fixed parse button remaining disabled while listening
- Fixed transcript losing initial words
- Fixed dropdown visibility (white text on dark background)
- Fixed close button styling in modals
- Fixed medication field combining name and dosage
- Fixed voice button visibility issues
- Fixed CSS import errors for edit modals
- Added proper cleanup for speech recognition

### Technical Improvements 🛠️

#### Performance

- Optimized API calls with proper error handling
- Reduced re-renders with improved state management
- Efficient data fetching with `useCallback` hooks

#### Code Quality

- Consistent styling classes across all components
- Reusable modal components
- Proper error boundaries
- TypeScript-ready structure
- Clean separation of concerns

#### Dependencies

- Updated to use Web Speech Recognition API
- Added Hugging Face Inference API integration
- Updated to React 18.2.0 with modern hooks
- Updated to Flask 3.0.0 with CORS support

### Documentation 📚

- Updated `README.md` with all new features
- Added voice feature usage guide
- Documented API endpoints
- Added setup instructions for AI features
- Created comprehensive `CHANGELOG.md`

---

## [1.0.0] - 2025-10-XX

### Initial Release

#### Core Features

- User authentication (register/login)
- Doctor management (view, add, delete)
- Health records tracking
- Treatment monitoring
- Dashboard overview
- Mobile-responsive design
- Android APK build support

#### Technology Stack

- React 18.2.0 frontend
- Python Flask backend
- SQLite database
- Capacitor for mobile
- CSS Grid & Flexbox layouts

---

## Versioning

- **Major version (2.x.x)**: Breaking changes, major feature additions
- **Minor version (x.1.x)**: New features, backward compatible
- **Patch version (x.x.1)**: Bug fixes, minor improvements

## Links

- [GitHub Repository](https://github.com/Chronos778/LifeTrack)
- [Documentation](README.md)
- [Issues](https://github.com/Chronos778/LifeTrack/issues)

 