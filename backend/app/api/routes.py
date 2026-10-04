from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Header
from typing import Optional, Dict, Any
from app.models.schemas import (
    AnalyzeRequest, AnalysisResponse, StartInterviewRequest,
    SubmitAnswerRequest, PerformanceReport
)
from app.services.extractor import extract_text_from_upload
from app.services.analyzer import analyze_documents
from app.services.interview_engine import (
    start_interview_session, process_candidate_turn, sessions
)
from app.services.evaluator import generate_interview_report

router = APIRouter()

# Realistic Preset Data for Instant Evaluation
SAMPLE_DATA = {
    "ai_intern": {
        "title": "AI Engineer Intern (from Assignment Spec)",
        "jd": """Role: AI Engineer Intern
Company: Student Credibility (studentcredibility.com)
Location: Remote / Hybrid

About the Role:
We are looking for an AI Engineer Intern to help build the next generation of AI-driven interview acceleration tools.
You will work closely with our engineering team to design, evaluate, and scale LLM applications, RAG pipelines, and conversational interfaces.

Key Responsibilities:
- Design and implement Retrieval-Augmented Generation (RAG) pipelines for candidate evaluation.
- Build robust backend APIs with Python and FastAPI.
- Experiment with prompt engineering, embeddings, and vector databases.
- Benchmark and optimize model latency, accuracy, and cost.
- Collaborate with frontend engineers to ship responsive, conversational AI products.

Required Skills:
- Python (advanced data structures, async programming, OOP)
- Machine Learning fundamentals and LLMs (OpenAI, Gemini, HuggingFace)
- Retrieval-Augmented Generation (RAG) and Vector Databases (Chroma, Pinecone)
- RESTful APIs (FastAPI or Flask)
- Git & Version Control

Preferred Skills:
- Docker and containerization
- System Design for distributed systems
- Prompt engineering & evaluation frameworks (RAGAS, TruLens)

Behavioural Competencies:
- Problem Solving
- Communication
- Learning Ability & Ownership
""",
        "resume": """Alex Chen
San Francisco, CA | alex.chen@example.com | github.com/alexchen | linkedin.com/in/alexchen

SUMMARY:
Passionate final-year Computer Science student with hands-on experience in generative AI, Python development, and applied machine learning. Built multiple production-grade prototypes utilizing RAG architectures and modern LLMs.

EDUCATION:
B.S. in Computer Science | GPA: 3.85 / 4.0 | Expected Graduation: May 2026

TECHNICAL SKILLS:
Languages: Python, JavaScript, TypeScript, SQL, HTML/CSS
AI/ML: PyTorch, LangChain, LlamaIndex, OpenAI API, Gemini API, HuggingFace, RAG, ChromaDB, Sentence-Transformers
Backend & Tools: FastAPI, Flask, PostgreSQL, Docker, Git, Linux, Postman

KEY PROJECTS:
1. RAG-Based Educational Assistant (Final-Year Capstone)
- Architected an end-to-end RAG system indexing 5,000+ course lecture notes and textbooks using ChromaDB and OpenAI text-embedding-3-small.
- Implemented recursive chunking with 500-token windows and 50-token overlap, improving context retrieval precision by 24%.
- Developed a high-performance FastAPI backend serving answers with an average latency of 1.2 seconds.
- Conducted user study with 60 students; achieved 91% satisfaction rating.

2. Document Summarizer & Q&A Service
- Built asynchronous REST APIs in FastAPI with background tasks for batch document processing.
- Integrated automated fallback handling across Gemini Flash and GPT-4o-mini to guarantee 99.9% uptime.
- Optimized vector search queries using hybrid retrieval (BM25 + cosine similarity).

3. Model Evaluation Benchmark Suite
- Developed an automated benchmark testing LLM responses against ground-truth evaluation sets.
- Claimed 18% improvement in baseline model response accuracy through few-shot prompt chaining.

EXPERIENCE:
Software Engineering Intern | TechNova Labs (June 2025 - August 2025)
- Collaborated on developing internal microservices using Python and FastAPI.
- Authored unit test suites achieving 88% test coverage across core ingestion pipelines.
- Participated in weekly agile standups and presented sprint demos to product stakeholders.
"""
    },
    "fullstack_engineer": {
        "title": "Full Stack Engineer (Frontend + Backend)",
        "jd": """Role: Full Stack Software Engineer Intern
We are seeking an ambitious software engineer to build scalable web applications.
Responsibilities:
- Build modern single-page applications with React and TypeScript.
- Develop RESTful APIs using Python / FastAPI and PostgreSQL.
- Ensure end-to-end reliability, clean architecture, and responsive UX.
Required Skills: React, Python, FastAPI, TypeScript, PostgreSQL, Git.
Preferred: Docker, Redis, TailwindCSS.""",
        "resume": """Jordan Taylor
Passionate software developer experienced in React and Python.
Projects:
- Built full-stack e-commerce dashboard with React, Vite, and FastAPI.
- Designed relational schemas in PostgreSQL with SQLAlchemy ORM.
- Containerized development workflow with Docker Compose."""
    }
}

@router.post("/extract-text")
async def extract_text_endpoint(file: UploadFile = File(...)):
    """Upload a file (PDF, DOCX, TXT) and return the extracted raw text."""
    text = await extract_text_from_upload(file)
    return {
        "filename": file.filename,
        "content_length": len(text),
        "text": text
    }

@router.get("/sample-data")
async def get_sample_data():
    """Retrieve preloaded sample job descriptions and resumes for immediate testing."""
    return SAMPLE_DATA

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_role_and_candidate(
    payload: AnalyzeRequest,
    x_api_key: Optional[str] = Header(None, alias="X-Api-Key")
):
    """Run Step 1 (Role Analysis) and Step 2 (Candidate Analysis & Job Fit)."""
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    if not payload.resume.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    
    active_key = payload.api_key or x_api_key
    result = await analyze_documents(
        jd_text=payload.job_description,
        resume_text=payload.resume,
        api_key=active_key,
        provider=payload.provider or "gemini"
    )
    return result

@router.post("/interview/start")
async def start_interview(
    payload: StartInterviewRequest,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_api_key: Optional[str] = Header(None, alias="X-Api-Key")
):
    """Start an AI Interview Simulator session and return the first personalized screening question."""
    if x_user_id and not payload.user_id:
        payload.user_id = x_user_id
    if x_api_key and not payload.api_key:
        payload.api_key = x_api_key
    session_info = await start_interview_session(payload)
    return session_info

@router.post("/interview/respond")
async def submit_answer(
    payload: SubmitAnswerRequest,
    x_api_key: Optional[str] = Header(None, alias="X-Api-Key")
):
    """Submit candidate's answer (voice transcript or text), evaluate answer, adaptively return next question."""
    if not payload.answer_text.strip():
        raise HTTPException(status_code=400, detail="Answer text cannot be empty.")
    if x_api_key and not payload.api_key:
        payload.api_key = x_api_key
    
    response = await process_candidate_turn(payload)
    return response

@router.post("/interview/finish/{session_id}")
async def finish_interview(session_id: str):
    """Prematurely or normally complete interview session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    
    state = sessions[session_id]["state"]
    state.is_finished = True
    return {"session_id": session_id, "is_finished": True, "message": "Interview session completed."}

@router.get("/interview/report/{session_id}", response_model=PerformanceReport)
async def get_performance_report(
    session_id: str,
    provider: Optional[str] = Query("gemini"),
    x_api_key: Optional[str] = Header(None, alias="X-Api-Key")
):
    """Generate Step 4 Performance Report with overall score, competencies, question feedback, and prep roadmap."""
    try:
        report = await generate_interview_report(session_id, api_key=x_api_key, provider=provider)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.post("/transcribe-audio")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """Transcribe recorded microphone audio using server-side Gemini multimodal AI."""
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty.")
    
    mime_type = file.content_type or "audio/webm"
    from app.services.llm_service import llm_service
    transcript = await llm_service.transcribe_audio(audio_bytes=audio_bytes, mime_type=mime_type)
    
    return {
        "success": bool(transcript),
        "transcript": transcript or "",
        "audio_bytes_length": len(audio_bytes)
    }

@router.get("/history")
async def get_history(
    limit: int = 50,
    user_id: Optional[str] = None,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Retrieve list of completed interview sessions for the current user from database."""
    from app.db.database import list_interview_history
    active_uid = user_id or x_user_id
    records = list_interview_history(user_id=active_uid, limit=limit)
    return {"history": records}

@router.get("/history/{session_id}")
async def get_history_session(
    session_id: str,
    user_id: Optional[str] = None,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Retrieve full performance report and turn dialogue for a saved session."""
    from app.db.database import get_interview_history_detail
    active_uid = user_id or x_user_id
    record = get_interview_history_detail(session_id, user_id=active_uid)
    if not record:
        raise HTTPException(status_code=404, detail="Interview session not found in database.")
    return record

@router.delete("/history/{session_id}")
async def delete_history_session(
    session_id: str,
    user_id: Optional[str] = None,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Delete a specific interview record belonging to the user from database."""
    from app.db.database import delete_interview_history_record
    active_uid = user_id or x_user_id
    deleted = delete_interview_history_record(session_id, user_id=active_uid)
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found or not owned by user.")
    return {"success": True, "message": f"Deleted session {session_id}"}

@router.delete("/history")
async def clear_history(
    user_id: Optional[str] = None,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Clear all interview history for the current user from database."""
    from app.db.database import clear_all_interview_history
    active_uid = user_id or x_user_id
    count = clear_all_interview_history(user_id=active_uid)
    return {"success": True, "deleted_count": count}

@router.get("/health")
async def health_check():
    """Health check endpoint reporting API and AI configuration status."""
    from app.config import GEMINI_API_KEY, OPENAI_API_KEY
    return {
        "status": "ok",
        "service": "Interview Accelerator API",
        "gemini_configured": bool(GEMINI_API_KEY and len(GEMINI_API_KEY.strip()) > 5),
        "openai_configured": bool(OPENAI_API_KEY and len(OPENAI_API_KEY.strip()) > 5)
    }

@router.post("/test-key")
async def test_key(
    payload: Optional[Dict[str, Any]] = None,
    x_api_key: Optional[str] = Header(None, alias="X-Api-Key")
):
    """Test validity of a Gemini API key."""
    from app.services.llm_service import llm_service
    from app.config import GEMINI_API_KEY
    key = (payload.get("api_key") if payload else None) or x_api_key or GEMINI_API_KEY
    if not key or not key.strip():
        return {"valid": False, "message": "No API key provided."}
    
    clean_key = key.strip()
    res = await llm_service.generate_content("Ping. Reply 'pong'.", api_key=clean_key, provider="gemini")
    if res and len(res.strip()) > 0:
        return {"valid": True, "message": f"Successfully verified Gemini AI! (Response: '{res.strip()[:30]}')"}
    return {"valid": False, "message": "Could not connect to Gemini API with this key. Check that the key is valid and has the Gemini API enabled."}
