# Changelog

All notable changes to LifeTrack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-05

### Added - AI-Powered Features 🤖

#### Voice-to-Text System
- **Voice-to-Record Modal**: Speak naturally to add health records
  - Real-time speech recognition using Web Speech API
  - AI-powered parsing with Google Gemini
  - Extracts doctor, diagnosis, date, medication, and dosage
  - Editable preview before saving
  - Accessible from Home, Records pages
  
- **Voice-to-Doctor Modal**: Add doctors via voice
  - Natural language doctor information entry
  - Extracts name, specialization, phone, email, address
  - Smart parsing with regex fallback
  - Dark glassmorphism UI design
  
#### AI Health Insights
- Multi-model fallback system (Gemini 2.0 Flash Exp, 2.0 Flash, 1.5 Flash, 1.5 Pro)
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

### Added - Full CRUD Operations ✏️

#### Edit Functionality
- **Edit Doctor Modal**: Update doctor information
  - Name, specialization, contact, email editing
  - Form validation and error handling
  - Success notifications
  
- **Edit Health Record Modal**: Modify medical records
  - Doctor, diagnosis, date, file path editing
  - Doctor dropdown selection
  - Styled with glassmorphism design
  
- **Edit Treatment Modal**: Update treatment details
  - Medication, procedure/dosage, follow-up date
  - Textarea for detailed instructions
  - Form validation

#### Delete Functionality
- Cascade delete for doctors (removes related records and treatments)
- Confirmation dialogs before deletion
- Success feedback after deletion
- Proper error handling

#### UI Enhancements
- Edit (✏️) and Delete (🗑️) buttons on all cards
- Touch-friendly button sizes (44px minimum)
- Hover effects with scale animations
- Cyan theme for edit buttons
- Red theme for delete buttons
- `.card-actions` layout for button grouping

### Added - UI/UX Improvements 🎨

#### Styling
- Modern glassmorphism design throughout
- Dark theme for voice modals
- Cyan (#00d9ff) accent color
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

### Changed - API Enhancements 🔧

#### Backend
- Added PUT endpoints for doctors, health_records, treatments
- Enhanced error handling with detailed messages
- Improved AI parsing prompts for better accuracy
- Added medication/dosage separation logic
- Backend logging for debugging
- 30-second timeout for voice parsing

#### Frontend
- Added `updateDoctor`, `updateHealthRecord`, `updateTreatment` API methods
- Enhanced error messages in modals
- Console logging for debugging
- Better state management for edit modals

### Fixed - Bug Fixes 🐛

- Fixed duplicate "Dr." prefix in doctor dropdown
- Fixed speech recognition "already started" errors
- Fixed parse button disabled while listening
- Fixed transcript losing initial words
- Fixed dropdown visibility (white text on dark background)
- Fixed close button styling in modals
- Fixed medication field combining name and dosage
- Fixed voice buttons visibility issues
- Fixed CSS import errors for edit modals
- Added proper cleanup for speech recognition

### Technical Improvements 🛠️

#### Performance
- Optimized API calls with proper error handling
- Reduced re-renders with proper state management
- Efficient data fetching with useCallback hooks

#### Code Quality
- Consistent styling classes across all components
- Reusable modal components
- Proper error boundaries
- TypeScript-ready structure
- Clean code separation

#### Dependencies
- Updated to use Web Speech Recognition API
- Google Gemini API integration
- React 18.2.0 with modern hooks
- Flask 3.0.0 with CORS support

### Documentation 📚

- Updated README.md with all new features
- Added voice feature usage guide
- Documented API endpoints
- Added setup instructions for AI features
- Created comprehensive CHANGELOG.md

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
