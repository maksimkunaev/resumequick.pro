# ResumeQuick

AI-powered resume builder with ATS scoring and PDF export.

## Tech Stack

- **Backend**: Python 3.8+ / Flask
- **Frontend**: React 18+
- **AI/LLM**: Groq API (supports OpenAI as alternative)
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **PDF Generation**: HTML to PDF conversion

## Features

- AI-powered resume generation using Groq LLM
- Real-time editing with preview
- PDF export
- ATS score evaluation
- Email feedback system
- User authentication via Firebase

## Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- Firebase project
- Groq API key ([groq.com](https://groq.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/resumequick.git
cd resumequick
```

2. **Backend Setup**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**

Create `.env` in project root:
```bash
FLASK_ENV=development
HOST=0.0.0.0
PORT=8000

# Required
GROQ_API_KEY="your_groq_api_key_here"
# OPENAI_API_KEY="your_openai_api_key_here"  # Optional alternative

# Firebase Backend
# Download serviceAccountKey.json from Firebase Console → Project Settings → Service Accounts
# Place in root directory, or set custom path:
# FIREBASE_SERVICE_ACCOUNT_KEY=./path/to/serviceAccountKey.json

# Static Files
STATIC_FOLDER=./frontend/build
STATIC_URL_PATH=/
SECOND_STATIC_FOLDER=./static

# Optional: Email feedback
GMAIL_USERNAME=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
FEEDBACK_EMAIL_TO=feedback@example.com

DAILY_FREE_CREDITS=999999
```

Create `.env` in `frontend/` directory:
```bash
# Firebase Frontend Configuration
# Get from Firebase Console → Project Settings → General → Your apps

```

4. **Firebase Setup**

- Create Firebase project at [firebase.google.com](https://firebase.google.com)
- Enable Authentication (Google provider)
- Create Firestore database
- **Backend**: Download service account key from Project Settings → Service Accounts, save as `serviceAccountKey.json` in root
- **Frontend**: Get config from Project Settings → General → Your apps, add to `frontend/.env`

5. **Frontend Setup**
```bash
cd frontend
npm install
npm run build
cd ..
```

6. **Run**
```bash
python corekit/app.py
```

Access at `http://localhost:8000`

## Configuration

### LLM Providers

Supports Groq (default) and OpenAI. Configure in `feature_services/llm/llm_client.py`.

### Customization

- **Resume Templates**: `frontend/src/components/ResumeTemplate.js`
- **AI Prompts**: `feature_services/resume/resume_service.py`
- **Styling**: CSS Modules in `frontend/src/components/`

## Troubleshooting

**Firebase Authentication Issues**
- Enable Google sign-in provider in Firebase
- Verify `serviceAccountKey.json` is in root directory
- Check `frontend/.env` has all `REACT_APP_FIREBASE_*` variables
- Rebuild frontend after updating `.env`: `npm run build`

**LLM Generation Issues**
- Verify Groq API key is valid
- Check server logs for errors

**PDF Generation Issues**
- Ensure all dependencies installed: `pip install -r requirements.txt`
- Check temporary file permissions

## Security

- All credentials stored in `.env` files
- Firebase google auth