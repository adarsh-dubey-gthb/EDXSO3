# EDXSO3 — AI-Powered Interview Accelerator (Assignment 3)
> **Product Architecture**: FastAPI Backend + React Vite SPA (Vanilla CSS)  
> **Evaluation Engine**: Dynamic Adaptive 3-Level Mock Interview with Real-Time Voice & Video Telemetry

---

## 🚀 Overview

The **Interview Accelerator** is an AI-powered system designed to prepare students and job candidates for real technical interviews. Instead of generic, canned questions or static checklists, the platform:
1. **Understands Any Role**: Dynamically deconstructs any user-supplied Job Description (JD) into responsibilities, required skills, competencies, and qualifications.
2. **Understands The Candidate**: Analyzes the candidate's actual resume against the role requirements, extracts real projects, flags metrics/claims that require verification, and calculates a mathematically grounded **Job Fit Score**.
3. **Conducts a 3-Level Adaptive Interview**:
   - **Level 1 — Screening Interview**: Dynamically cites projects directly from the candidate's resume (e.g. project problem, ownership, technical decisions).
   - **Level 2 — Competency Interview**: Tests practical domain competency, error handling, debugging methodology, and system scalability.
   - **Level 3 — Deep-Dive Interview**: Simulates a challenging technical interviewer by identifying weak or vague answers, probing resume metrics/claims, and asking dynamic counter-questions.
4. **Mandatory Voice & Video Experience**:
   - **Voice AI**: Hands-free / push-to-talk speech-to-text (STT), natural voice text-to-speech (TTS), and audio replay.
   - **Video Preview**: Live webcam integration (`navigator.mediaDevices.getUserMedia`) with mirror toggle.
   - **Real-Time Speech Telemetry**: Speaking pace (WPM), filler word detector ("um", "uh", "like", "basically", etc.), response duration, and confidence index.
5. **Comprehensive Performance Report**:
   - Overall Score gauge (0–100)
   - Interview Readiness Badge (🔴 Not Ready / 🟠 Needs Preparation / 🟡 Interview Ready / 🟢 Strong Candidate)
   - 7 Core Competency Scores (Role Fit, Technical Knowledge, Problem Solving, Communication, Confidence, Depth of Understanding, Behavioural Fit)
   - Question-by-Question feedback (What was good, What could be better, Ideal direction / model answer)
   - Demonstrated Strengths & Specific Weaknesses
   - Prioritized Preparation Roadmap (Priority 1, Priority 2, Priority 3 with skill-specific topic checklists)
   - Personalized 5-Day Study Schedule
   - Print / PDF export and persistent local interview history.

---

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python 3.12), Pydantic v2, Uvicorn, SQLite3 (persistent WAL-mode history database), PyPDF, python-docx, Google GenAI SDK (`google-genai`), HTTPX.
- **Frontend**: React 18, Vite, Vanilla CSS (custom glassmorphism design tokens, Outfit & Plus Jakarta Sans typography, micro-animations, no Tailwind dependency), Lucide Icons, Canvas Confetti.
- **Database**: Native SQLite (`backend/interview_history.db`) with zero external dependency for persistent multi-session history, dialogue records, and reports.
- **AI / LLM Integration**: Google Gemini API (`gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`, `gemini-3.8-flash`, `gemini-flash-latest`) + OpenAI API (`gpt-4o-mini`) + pure dynamic document parsing & adaptive heuristic fallback.
- **Audio / Video**: Web Speech Synthesis API, Web Speech Recognition API (with auto-restart), WebRTC MediaStream API, Gemini Multimodal Audio STT.

---

## 📦 Project Structure

```
assignment3/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py             # REST API endpoints (/analyze, /interview/*, /history/*, /transcribe-audio)
│   │   ├── db/
│   │   │   └── database.py           # SQLite persistent storage for sessions & performance reports
│   │   ├── models/
│   │   │   └── schemas.py            # Pydantic data schemas
│   │   ├── services/
│   │   │   ├── analyzer.py           # Role & candidate analysis + Job Fit scoring
│   │   │   ├── extractor.py          # PDF / DOCX / TXT file extraction
│   │   │   ├── interview_engine.py   # 3-level adaptive interview state manager & dynamic question generator
│   │   │   ├── evaluator.py          # Comprehensive performance report & study plan synthesizer
│   │   │   └── llm_service.py        # Gemini & OpenAI provider interface
│   │   └── config.py                 # Configuration & environment variables
│   ├── interview_history.db          # Persistent SQLite database file
│   ├── requirements.txt              # Backend dependencies
│   ├── .env                          # Server-side API key (never exposed to client)
│   └── main.py                       # FastAPI entrypoint (Port 8000)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation, progress, modal triggers
│   │   │   ├── InputScreen.jsx       # JD & Resume inputs (paste text or file upload)
│   │   │   ├── RoleAnalysisScreen.jsx# Step 1: Role breakdown dashboard
│   │   │   ├── CandidateFitScreen.jsx# Step 2: Fit score gauge & flagged claims
│   │   │   ├── InterviewRoomScreen.jsx# Step 3: Interactive voice & video interview simulator
│   │   │   ├── PerformanceReportScreen.jsx # Step 4: Report with scores & prep roadmap
│   │   │   ├── SettingsModal.jsx     # API keys & interviewer persona settings
│   │   │   └── HistoryModal.jsx      # Past session comparison & history
│   │   ├── services/
│   │   │   ├── api.js                # Frontend API client
│   │   │   └── speech.js             # Web Speech STT/TTS & live telemetry
│   │   ├── styles/
│   │   │   └── index.css             # Vanilla CSS design system
│   │   ├── App.jsx                   # Main orchestrator
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
pip install -r requirements.txt

# Start FastAPI server (Port 8000)
python -m uvicorn main:app --app-dir . --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Start Vite dev server (Port 5173)
npx vite --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173/` in your browser.

---

## 🧠 Dynamic Personalization Logic

- **No Hardcoded Data**: Inputs start blank so you can paste any custom Job Description and Resume or upload `.pdf` / `.docx` files.
- **Dynamic Questioning**:
  - The opening question references the **exact projects, technologies, and achievements** found in the candidate's resume.
  - As the candidate speaks, the AI evaluates technical depth in real time. If the response is vague, the system generates an immediate counter-question challenging the candidate to provide concrete trade-offs or metric proofs.
- **Adaptive Level Progression**:
  - Turns 1–2: **Screening Interview** (Ownership, practical experience, role alignment)
  - Turns 3–4: **Competency Interview** (Technical design, concurrency, debugging, error recovery)
  - Turns 5–6: **Deep-Dive Interview** (Challenging metric baselines, probe flagged resume claims, system failure modes)
- **API Key Configuration**:
  - Click **Settings** in the navbar to enter a Google Gemini API Key or OpenAI API Key.
  - The system also includes an intelligent dynamic parser and heuristic engine that operates 100% offline without crashing or requiring paid tokens.
