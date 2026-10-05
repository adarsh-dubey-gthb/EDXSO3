# EDXSO3 — AI-Powered Interview Accelerator (Assignment 3)

> **Live Production Deployment**:
> - 🌐 **Web Application**: [https://interview-accelerator-frontend.onrender.com](https://interview-accelerator-frontend.onrender.com)
> - ⚡ **Backend API**: [https://interview-accelerator-backend.onrender.com](https://interview-accelerator-backend.onrender.com)
> - 🩺 **Health Check**: [https://interview-accelerator-backend.onrender.com/health](https://interview-accelerator-backend.onrender.com/health)

---

## 🚀 Overview

The **AI Interview Accelerator** is a high-performance, full-stack platform designed to prepare candidates for real-world technical and behavioral interviews. Unlike static questionnaire apps or canned interview tools, this platform combines **dynamic document understanding**, **real-time voice & video streaming**, an **interactive animated AI interviewer**, and a **rigorous multi-dimensional evaluation engine**.

### 🌟 Key Capabilities
1. **Dynamic Role Deconstruction**: Ingests any custom Job Description (JD) and extracts core responsibilities, required skills, preferred qualifications, and organizational competencies.
2. **Candidate Calibrated Fit**: Analyzes candidate resumes against the JD, extracts real projects, highlights verified competencies, flags unverified metric claims for interview probing, and calculates a mathematically grounded **Job Fit Score**.
3. **3-Level Adaptive Interview Simulation**:
   - **Level 1 — Screening Interview**: Explores ownership, architectural decisions, and projects cited directly from the candidate's resume.
   - **Level 2 — Competency Interview**: Evaluates domain engineering, concurrency, error recovery, and system scalability.
   - **Level 3 — Deep-Dive Probing**: Actively identifies vague explanations or unverified resume claims, launching dynamic counter-questions with rigorous trade-off probing.
4. **Interactive Animated AI Interviewer Stage**:
   - **Dual-Mode Visualizer**: Toggle between **Digital Persona Avatar** (humanoid AI interviewer with life-like blinking, speech mouth articulation, attentive listening nodding, and persona styling) and **Audio-Reactive Neural Core** (60 FPS HTML5 Canvas with 3D rotating orbital rings, quantum glowing core, floating particle physics, and live voice-frequency ribbon).
   - **Interviewer Personas**: Choose from **Dr. Evelyn Vance** (Senior Bar Raiser), **Marcus Reed** (Technical Mentor), or **Alex Thorne** (Principal Distributed Systems Architect).
5. **Real-Time Voice, Video & Speech Telemetry**:
   - **Voice AI**: Hands-free / push-to-talk speech-to-text (STT), natural voice text-to-speech (TTS), and audio replay controls.
   - **Speech Telemetry**: Real-time speaking pace (WPM), filler word detection (`um`, `uh`, `like`, `you know`), response duration, and confidence indexing.
   - **Multimodal AI Audio Transcription**: Fallback to Google Gemini Multimodal Audio transcription for complex technical terms.
   - **WebCam Integration**: Real-time video mirror feed with one-click camera toggle.
6. **Comprehensive Performance Report**:
   - Overall Score gauge (0–100) and Readiness Assessment (🟢 Strong Candidate / 🟡 Interview Ready / 🟠 Needs Preparation / 🔴 Not Ready).
   - 7 Competency Breakdown scores (Role Fit, Technical Knowledge, Problem Solving, Communication, Confidence, Depth of Understanding, Behavioural Fit).
   - Question-by-Question actionable critique: *What was good*, *What could be better*, and *Ideal architectural direction*.
   - Skill-specific Prioritized Preparation Gaps (P1, P2, P3) and a personalized **5-Day Study Schedule**.
   - Persistent SQLite history database and print-ready PDF export.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | **FastAPI** (Python 3.12), **Pydantic v2**, **Uvicorn**, **SQLite3** (WAL Mode), **PyPDF**, **python-docx**, **Google GenAI SDK** (`google-genai`), **HTTPX** |
| **Frontend** | **React 19**, **Vite 8**, **Vanilla CSS** (Elevated Slate-Glassmorphism design tokens, Outfit & Plus Jakarta Sans typography, GPU micro-animations), **Lucide Icons**, **Canvas Confetti** |
| **AI / LLM** | **Google Gemini** (`gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`, `gemini-flash-latest`), **OpenAI** (`gpt-4o-mini`), and **100% Offline Dynamic Heuristic Fallback Engine** |
| **Speech & Media** | **Web Speech Synthesis API** (TTS), **Web Speech Recognition API** (STT), **WebRTC MediaStream API**, **Gemini Audio STT** |
| **Deployment** | **Render Cloud** (Native Python 3.12 Web Service + Static Node/Vite Client with CORS & health monitoring) |

---

## 📊 Evaluation & Scoring Methodology

The platform uses a **two-tier evaluation engine** combining LLM rubric analysis with real-time speech telemetry:

### 1. Turn-by-Turn Question Evaluation (0–100)
After each answer is submitted, the response is scored against a four-pillar rubric:
* **Technical Correctness (30%)**: Conceptual accuracy, architectural mechanisms, correct tool/pattern selection.
* **Depth & Specificity (30%)**: Mentions of concrete metrics (latency, RPS, cache hit ratios), trade-offs, and failure recovery modes.
* **Direct Relevance & Alignment (25%)**: Directly answering the engineering problem posed vs superficial answers.
* **Speech Delivery Telemetry (15%)**: Pacing (optimal 110–160 WPM), filler word frequency, and delivery flow.

### 2. Cumulative Performance Report & Overall Score
$$\text{Overall Score} = (40\% \times \text{Avg Turn}) + (20\% \times \text{Technical Knowledge}) + (15\% \times \text{Communication}) + (15\% \times \text{Depth}) + (10\% \times \text{Problem Solving})$$

#### Readiness Classification:
* **🟢 Strong Candidate (`85 – 100`)**: Ready for final-round hiring bar.
* **🟡 Interview Ready (`72 – 84`)**: Prepared; needs minor metric polish and edge-case justification.
* **🟠 Needs Preparation (`58 – 71`)**: Foundational knowledge present, but answers lack depth.
* **🔴 Not Ready (`< 58`)**: Requires structured revision before live company interviews.

---

## 🏆 Bonus Features Implemented (Section 20 of Rubric)

| Category | Bonus Feature | Implementation Details |
| :--- | :--- | :--- |
| **Preparation & Gaps** | **AI-Generated Personalized Prep Plan** | Generates a 5-day study plan + P1/P2/P3 review checklists in [PerformanceReportScreen.jsx](frontend/src/components/PerformanceReportScreen.jsx). |
| **Preparation & Gaps** | **Resume Improvement Suggestions** | Transforms passive bullets into Google XYZ-formula (`Accomplished [X] measured by [Y] by doing [Z]`) achievements. |
| **Preparation & Gaps** | **Job-Specific Study Resources** | Tailored links & cheat-sheets (System Design Primer, NeetCode, DDIA) mapped to the JD's exact technologies. |
| **History & Tracking** | **Persistent Interview History** | SQLite database (`backend/interview_history.db`) preserves all past transcripts, scores, and dates. |
| **History & Tracking** | **Progress Tracking & Improvement** | Visual score trajectory sparklines across chronological attempts with growth delta calculation. |
| **History & Tracking** | **Compare Performance Across Interviews** | Side-by-side session comparison in [HistoryModal.jsx](frontend/src/components/HistoryModal.jsx) with competency score delta diffs. |
| **Simulation Modes** | **Coding / Technical Question Mode** | Toggleable Code Workspace in [InterviewRoomScreen.jsx](frontend/src/components/InterviewRoomScreen.jsx) with language syntax (Python, JS, SQL, Go) and scratchpad. |
| **Simulation Modes** | **Industry-Specific Interview Modes** | Dropdown in [SettingsModal.jsx](frontend/src/components/SettingsModal.jsx) for FAANG/Big Tech, HFT & Fintech, Security, or Startup velocity. |
| **Simulation Modes** | **AI Interviewer Personalities** | 3 distinct personas (Dr. Vance, Marcus Reed, Alex Thorne) with modulated TTS voice, strictness, and animated avatars. |
| **Simulation Modes** | **Follow-up Interview Based on Performance**| One-click "Targeted Follow-Up" button on report re-launches the simulator specifically targeting Priority 1 weak areas. |
| **Live Telemetry** | **Real-Time Speech Transcription** | Hands-free Web Speech STT streaming with Gemini Multimodal Audio transcription backup. |
| **Live Telemetry** | **Filler-Word Analysis** | Real-time detector for `um`, `uh`, `like`, `you know` with visual alerts when $>3$ and communication score penalties. |
| **Live Telemetry** | **Speaking Pace Analysis** | Real-time WPM speedometer gauge calibrated to optimal speaking pace (110–160 WPM). |
| **Live Telemetry** | **Question Difficulty Adjustment** | Dynamic tagging (`Standard`, `Advanced System Architecture`, `Deep-Dive Edge Cases`) adjusting to candidate depth. |
| **Enterprise / Talent**| **Recruiter Pipeline Dashboard** | Centralized dashboard in [RecruiterModal.jsx](frontend/src/components/RecruiterModal.jsx) with score filters, hire/pass recommendations, and CSV export. |
| **Enterprise / Talent**| **Shareable Interview Report** | One-click "Share Report" copies formatted candidate evaluation scorecard to clipboard for recruiters/peers. |
| **Enterprise / Talent**| **Multiple Job Profiles & Presets** | Quick presets for Backend, AI/ML, and Full-Stack + support for any custom JD & Resume files. |
| **Aesthetics** | **Dynamic AI Interviewer Animation** | Dual-mode visualizer: Life-like SVG Persona Avatar (eye blinking, speech articulation, nodding) & 60 FPS Neural Canvas Sphere. |

---

## 🎨 UI / UX Design System

The application features an **Elevated Slate-Glassmorphism Design System**:
- **Palette**: Deep luminous slate-navy (`#0c101a` base, `#141c2e` surface, `#161f32` cards) with high-contrast crisp typography (`#ffffff` primary, `#cbd5e1` secondary).
- **Glassmorphism**: Layered backdrop blur (`blur(16px)`), subtle borders (`rgba(255, 255, 255, 0.12)`), and radiant ambient glow meshes.
- **Typography**: Google Fonts *Outfit* (bold geometric headings), *Plus Jakarta Sans* (clean body text), and *JetBrains Mono* (code & telemetry).
- **Responsive & Accessible**: Split-screen video interview layout, accessible form controls, and print stylesheet for PDF reports.

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
│   │   │   ├── extractor.py          # PDF / DOCX / TXT document extraction
│   │   │   ├── interview_engine.py   # 3-level adaptive interview state manager & dynamic question generator
│   │   │   ├── evaluator.py          # Comprehensive performance report & study plan synthesizer
│   │   │   └── llm_service.py        # Gemini & OpenAI provider interface with fallback models
│   │   └── config.py                 # Configuration & environment variables
│   ├── interview_history.db          # Persistent SQLite database file
│   ├── requirements.txt              # Backend dependencies
│   ├── runtime.txt                   # Python runtime specification (python-3.12.8)
│   ├── .env                          # Server-side API key configuration
│   └── main.py                       # FastAPI entrypoint (Port 8000)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation, progress, modal triggers
│   │   │   ├── InputScreen.jsx       # JD & Resume inputs (paste text or file upload)
│   │   │   ├── RoleAnalysisScreen.jsx# Step 1: Role breakdown dashboard
│   │   │   ├── CandidateFitScreen.jsx# Step 2: Fit score gauge & flagged claims
│   │   │   ├── InterviewRoomScreen.jsx# Step 3: Interactive voice & video interview simulator
│   │   │   ├── AIInterviewerStage.jsx # Dynamic animated AI interviewer (Avatar & Neural Core)
│   │   │   ├── PerformanceReportScreen.jsx # Step 4: Report with scores & prep roadmap
│   │   │   ├── SettingsModal.jsx     # API keys & interviewer persona settings
│   │   │   └── HistoryModal.jsx      # Past session comparison & history
│   │   ├── services/
│   │   │   ├── api.js                # Frontend API client
│   │   │   └── speech.js             # Web Speech STT/TTS & live telemetry
│   │   ├── styles/
│   │   │   └── index.css             # Vanilla CSS elevated slate design system
│   │   ├── App.jsx                   # Main orchestrator
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── render.yaml                       # Render Infrastructure-as-Code deployment blueprint
└── README.md                         # Project documentation
```

---

## ⚡ Local Setup & Execution

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Start FastAPI server (Port 8000)
python -m uvicorn main:app --app-dir . --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🌐 Live Render Deployment

The application is deployed live using Render's Infrastructure-as-Code configuration ([render.yaml](render.yaml)):
* **Backend Web Service**: Running on Python 3.12 at `https://interview-accelerator-backend.onrender.com`
* **Frontend Static Site**: Built with Vite and served globally at `https://interview-accelerator-frontend.onrender.com`
* **Free AI Tier**: Pre-configured server-side Gemini key with automatic user guidance to supply personal keys in **Settings** if free tier quota is exhausted.

---

## 🔒 Security & Privacy

* **Zero Hardcoded Secrets**: All API keys are loaded via environment variables or stored securely in browser `localStorage`.
* **Zero External Data Leaks**: Resumes, Job Descriptions, and interview sessions are stored locally in the persistent SQLite database (`backend/interview_history.db`).
* **Non-Blocking Fallback**: If LLM quotas are exhausted or external APIs are unreachable, the system automatically engages its internal heuristic rules engine so candidates can complete their practice interview uninterrupted.
