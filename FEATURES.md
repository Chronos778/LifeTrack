# LifeTrack Features Guide

Complete guide to all features available in LifeTrack Personal Health Record Management System.

## Table of Contents

1. [Core Features](#core-features)
2. [AI-Powered Features](#ai-powered-features)
3. [Voice Features](#voice-features)
4. [CRUD Operations](#crud-operations)
5. [User Interface](#user-interface)
6. [Mobile Features](#mobile-features)

---

## Core Features

### 👨‍⚕️ Doctor Management

**Add Doctors**
- Traditional form entry with name, specialization, contact, email
- Voice-powered entry (speak naturally to add doctor)
- Automatic validation and error checking

**View Doctors**
- Card-based layout with doctor information
- Specialization badges
- Contact details (phone, email, hospital, address)
- Search and filter functionality

**Edit Doctors**
- Click ✏️ icon on doctor card
- Update any doctor information
- Real-time validation
- Success notifications

**Delete Doctors**
- Click 🗑️ icon on doctor card
- Confirmation dialog before deletion
- Cascade delete (removes related records and treatments)
- Success feedback

### 📋 Health Records Management

**Add Records**
- Form-based entry with doctor selection, diagnosis, date
- Voice-to-record feature (AI extracts all details)
- Doctor dropdown with search
- Date picker for record date
- File path for attachments

**View Records**
- Chronological listing with doctor information
- Diagnosis display
- Record date and metadata
- Associated doctor details
- Search across all fields

**Edit Records**
- Click ✏️ icon on record card
- Modify doctor, diagnosis, date, file path
- Doctor selection dropdown
- Form validation

**Delete Records**
- Click 🗑️ icon on record card
- Confirmation before deletion
- Updates dashboard statistics

### 💊 Treatment Management

**Add Treatments**
- Link to existing health records
- Medication name and dosage
- Procedure/instructions
- Follow-up date scheduling

**View Treatments**
- Treatment cards with medication details
- Dosage badges
- Related condition information
- Doctor and record linkage

**Edit Treatments**
- Click ✏️ icon on treatment card
- Update medication, dosage, procedure
- Follow-up date modification
- Textarea for detailed instructions

**Delete Treatments**
- Click 🗑️ icon on treatment card
- Confirmation dialog
- Clean removal from database

---

## AI-Powered Features

### 🤖 AI Health Insights

**Personalized Analysis**
- Comprehensive health summary
- Analysis of all your medical records
- Doctor visit patterns
- Treatment history review

**Trend Detection**
- Identifies recurring conditions
- Frequency of doctor visits
- Common medications
- Health patterns over time

**Smart Recommendations**
- Actionable health advice
- Follow-up suggestions
- Medication adherence tips
- Preventive care recommendations

**Statistics Dashboard**
- Total doctors count
- Number of health records
- Active treatments
- Recent activity summary

**Technical Features**
- Multi-model fallback system:
  1. Gemini 2.0 Flash Exp (fastest)
  2. Gemini 2.0 Flash (stable)
  3. Gemini 1.5 Flash (reliable)
  4. Gemini 1.5 Pro (most capable)
- 60-second analysis timeout
- Automatic retry logic
- Error handling with user feedback

**How to Use**
1. Navigate to Dashboard/Home page
2. Click "AI Health Insights" button
3. Wait for AI analysis (5-30 seconds)
4. View personalized insights
5. Click refresh to update analysis

---

## Voice Features

### 🎤 Voice-to-Record

**What It Does**
- Converts speech to structured health record
- Extracts doctor, diagnosis, date, medication, dosage
- Uses browser's native speech recognition
- AI parses and categorizes information

**How to Use**
1. Click "🎤 Voice Record" button (Home or Records page)
2. Click "Start Listening" (green button)
3. Speak naturally, for example:
   ```
   "I visited Dr. Sarah Williams for high fever on October 15th. 
   She prescribed paracetamol 500mg twice daily."
   ```
4. Click "Parse with AI" when done
5. Review extracted information:
   - Doctor (auto-matched from database)
   - Diagnosis
   - Date (auto-formatted)
   - Medication (separated from dosage)
   - Dosage instructions
6. Edit any field if needed
7. Click "💾 Save Record"

**Features**
- Real-time transcription display
- Doctor auto-matching from existing database
- Separate medication name and dosage extraction
- Date parsing (relative dates like "yesterday", "last week")
- Confidence scoring
- Editable preview before saving
- Fallback parser if AI unavailable

**Supported Speech Patterns**
- "Visited Dr. [Name] for [condition]"
- "Saw [Doctor] on [date]"
- "Diagnosed with [condition]"
- "Prescribed [medication] [dosage]"
- "Take [medication] [frequency]"

### 🎤 Voice-to-Doctor

**What It Does**
- Adds new doctors via voice input
- Extracts name, specialization, contact information
- Handles various speech patterns
- Smart field extraction

**How to Use**
1. Click "🎤 Voice Doctor" button (Home or Doctors page)
2. Click "Start Listening"
3. Speak naturally, for example:
   ```
   "Doctor Sara Johnson, cardiologist, phone 550123, 
   email sara@hospital.com, 123 Medical Plaza, 
   specializes in heart conditions."
   ```
4. Click "Parse with AI"
5. Review and edit extracted information:
   - Name (includes Dr. title)
   - Specialization
   - Phone number
   - Email address
   - Address
   - Notes
6. Click "💾 Save Doctor"

**Features**
- Automatic "Dr." prefix addition
- Phone number extraction (various formats)
- Email extraction
- Specialization recognition (common medical fields)
- Address parsing
- Notes field for additional information
- Regex fallback parser

**Supported Formats**
- "Doctor [Name], [Specialization]"
- "[Specialty] named [Name]"
- "Phone: [number]" or just the number
- "Email: [email]" or just the email
- "Located at [address]"
- "Works at [hospital/clinic]"

### Voice Feature Technical Details

**Speech Recognition**
- Uses Web Speech API (webkitSpeechRecognition/SpeechRecognition)
- Continuous listening mode
- Interim results display
- Auto-stop when parsing
- Error handling for microphone access

**AI Parsing**
- Google Gemini API integration
- Structured JSON output
- Field validation
- Default value assignment
- Confidence scoring

**Fallback System**
- Regex-based extraction if AI fails
- Pattern matching for common formats
- Ensures data is never lost
- Basic field population

---

## CRUD Operations

### Create (Add)
- **Traditional Entry**: Forms with validation
- **Voice Entry**: AI-powered natural language input
- **Quick Add**: From dashboard shortcuts
- **Bulk Import**: (Future feature)

### Read (View)
- **List View**: All items in cards/tables
- **Detail View**: Click for full information
- **Search**: Filter by any field
- **Sort**: By date, name, etc.

### Update (Edit)
- **Edit Modal**: Click ✏️ button
- **Inline Editing**: (Future feature)
- **Batch Update**: (Future feature)
- **Form Validation**: Real-time error checking

### Delete (Remove)
- **Single Delete**: Click 🗑️ button
- **Confirm Dialog**: Prevent accidental deletion
- **Cascade Delete**: Removes related data (doctors)
- **Soft Delete**: (Future feature - recoverable)

---

## User Interface

### Design System

**Glassmorphism Theme**
- Frosted glass effect
- Backdrop blur
- Translucent backgrounds
- Subtle borders

**Color Scheme**
- Primary: Cyan (#00d9ff)
- Secondary: Dark blue gradients
- Success: Green (#10b981)
- Error: Red (#ff3b30)
- Background: Dark navy gradients

**Typography**
- Font: Inter, system-ui
- Weights: 300, 400, 600, 700
- Sizes: Responsive scaling
- Line height: 1.6 for readability

### Components

**Buttons**
- `.neo-btn`: Standard button
- `.neo-btn-primary`: Cyan gradient
- `.neo-btn-secondary`: Dark transparent
- `.edit-btn`: Cyan edit button (✏️)
- `.delete-btn`: Red delete button (🗑️)
- Hover effects and animations

**Modals**
- `.modal-overlay`: Full-screen backdrop
- `.modal-content`: Centered content
- `.modal-header`: Title and close button
- `.modal-actions`: Button row
- Smooth animations

**Forms**
- `.form-group`: Input grouping
- `.form-label`: Cyan labels
- `.neo-input`: Glassmorphic inputs
- `.alert`: Error/success messages
- Date pickers with dark theme

**Cards**
- `.doctor-card`: Doctor information
- `.record-card`: Health records
- `.treatment-card`: Treatment details
- Hover effects
- Action buttons

### Responsive Design

**Breakpoints**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Optimizations**
- Touch-friendly targets (44px minimum)
- Single-column layouts
- Collapsible navigation
- Bottom-fixed actions
- Safe area insets

**Tablet Optimizations**
- Two-column grids
- Sidebar navigation
- Larger touch targets

**Desktop Enhancements**
- Three-column layouts
- Hover states
- Keyboard shortcuts
- Multi-panel views

---

## Mobile Features

### Android App

**Installation**
- Download APK from releases
- Enable "Install from Unknown Sources"
- Install and launch

**Features**
- All web features available
- Native navigation
- Offline capable (future)
- Push notifications (future)
- Camera integration (future)

**Performance**
- Fast loading with Capacitor
- Native animations
- Optimized assets
- Minimal bundle size

### iOS App (Coming Soon)

**Planned Features**
- Face ID authentication
- Apple Health integration
- iCloud sync
- Siri shortcuts

---

## Future Features

### Planned Additions

- **Data Export**: PDF reports, CSV exports
- **Reminders**: Medication and appointment reminders
- **Calendar Integration**: Sync with Google Calendar
- **Charts & Graphs**: Visual health trends
- **Multi-language**: Support for multiple languages
- **Dark/Light Mode**: Toggle theme preference
- **Offline Mode**: Work without internet
- **Data Sync**: Cloud backup and sync
- **Family Accounts**: Manage family members' health
- **Doctor Portal**: Secure doctor access
- **Insurance Integration**: Claim management
- **Prescription Scanning**: OCR for prescriptions
- **Voice Commands**: Hands-free navigation
- **Wearable Integration**: Sync with fitness trackers

---

## Tips & Tricks

### Voice Features Tips

1. **Speak Clearly**: Moderate pace, clear pronunciation
2. **Quiet Environment**: Reduces recognition errors
3. **Natural Language**: Don't use robotic speech
4. **Include Context**: Mention doctor names, dates, conditions
5. **Review Before Saving**: Always check AI-extracted data
6. **Edit as Needed**: You can modify any field before saving

### Search Tips

1. **Partial Matches**: Search works with partial text
2. **Case Insensitive**: Capitals don't matter
3. **Multiple Fields**: Searches across all visible fields
4. **Clear Search**: Click X to reset search

### Performance Tips

1. **Regular Cleanup**: Delete old/unnecessary records
2. **Browser Cache**: Clear if experiencing issues
3. **Update Browser**: Use latest Chrome/Edge for voice features
4. **Microphone Permissions**: Allow when prompted

---

## Troubleshooting

### Voice Features Not Working

**Problem**: "Speech recognition not supported"
**Solution**: Use Chrome, Edge, or Safari (latest versions)

**Problem**: Microphone not accessible
**Solution**: Grant microphone permissions in browser settings

**Problem**: Poor transcription accuracy
**Solution**: 
- Speak more clearly and slowly
- Use in quiet environment
- Check microphone quality
- Try refreshing the page

### AI Features Not Working

**Problem**: "Failed to get insights"
**Solution**:
- Check internet connection
- Verify API key in .env file
- Wait and retry (may be rate limited)
- Check backend console for errors

**Problem**: Slow AI responses
**Solution**:
- Normal for first request (model loading)
- Expect 5-30 seconds for analysis
- Refresh if stuck after 60 seconds

### General Issues

**Problem**: Data not saving
**Solution**:
- Check form validation errors
- Ensure required fields filled
- Check browser console for errors
- Verify backend is running

**Problem**: Page not loading
**Solution**:
- Refresh the page
- Clear browser cache
- Check backend server status
- Verify correct URLs (localhost:3000, localhost:5000)

---

## Getting Help

- **Documentation**: README.md
- **Changelog**: CHANGELOG.md
- **GitHub Issues**: Report bugs
- **Email Support**: [Your email]
- **Community**: [Discord/Forum link]

---

**Last Updated**: November 5, 2025  
**Version**: 2.0.0  
**License**: MIT
