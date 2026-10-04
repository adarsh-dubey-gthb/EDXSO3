import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if available
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
PREFERRED_LLM = os.getenv("PREFERRED_LLM", "gemini")  # "gemini" or "openai" or "mock"

# Cloud Database URL (PostgreSQL / MySQL / Supabase / Neon) with SQLite local fallback
raw_db_url = os.getenv("DATABASE_URL", "").strip()
if raw_db_url:
    # Standardize postgres protocol for SQLAlchemy (e.g. Neon, Render, Supabase)
    if raw_db_url.startswith("postgres://"):
        DATABASE_URL = raw_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+"):
        DATABASE_URL = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    else:
        DATABASE_URL = raw_db_url
else:
    # Default to local SQLite database file
    db_path = (BASE_DIR / "interview_history.db").as_posix()
    DATABASE_URL = f"sqlite:///{db_path}"

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://interview-accelerator-frontend.onrender.com",
    "*"
]

