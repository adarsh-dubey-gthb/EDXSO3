import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, desc, text
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session

from app.config import DATABASE_URL

logger = logging.getLogger(__name__)

Base = declarative_base()

class InterviewHistory(Base):
    __tablename__ = "interview_history"

    session_id = Column(String(128), primary_key=True, index=True)
    user_id = Column(String(128), index=True, nullable=True)  # Isolated user/device identifier
    role_title = Column(String(255), nullable=False)
    candidate_name = Column(String(255), nullable=True)
    overall_score = Column(Integer, default=0)
    readiness_assessment = Column(String(100), nullable=True)
    readiness_badge_color = Column(String(50), nullable=True)
    turns_count = Column(Integer, default=0)
    average_wpm = Column(Integer, default=0)
    total_fillers = Column(Integer, default=0)
    interview_date = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    report_json = Column(Text, nullable=True)
    turns_json = Column(Text, nullable=True)
    role_analysis_json = Column(Text, nullable=True)
    candidate_analysis_json = Column(Text, nullable=True)

# Configure SQLAlchemy engine for cloud or local database
is_sqlite = DATABASE_URL.startswith("sqlite")
engine_kwargs: Dict[str, Any] = {}

if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Cloud database configuration (PostgreSQL on Neon, Supabase, AWS RDS, Render, etc.)
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def init_db():
    """Initialize database tables in Cloud PostgreSQL or local SQLite."""
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE interview_history ADD COLUMN user_id VARCHAR(128);"))
                conn.commit()
            except Exception:
                pass  # Column already exists
    except Exception as e:
        logger.error(f"Error initializing database schema: {e}")

def save_interview_session(
    session_id: str,
    role_title: str,
    candidate_name: str,
    overall_score: int,
    readiness_assessment: str,
    readiness_badge_color: str,
    report_data: Dict[str, Any],
    turns_data: Optional[List[Dict[str, Any]]] = None,
    role_analysis: Optional[Dict[str, Any]] = None,
    candidate_analysis: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None
) -> bool:
    """Upsert full interview session record into Cloud or local database for a specific user."""
    init_db()
    speech_analytics = report_data.get("speech_analytics") or {}
    avg_wpm = speech_analytics.get("average_wpm", 0)
    total_fillers = speech_analytics.get("total_filler_words", 0)
    turns_count = len(turns_data) if turns_data else len(report_data.get("question_feedbacks", []))
    interview_date = report_data.get("interview_date") or datetime.now().strftime("%B %d, %Y")

    session = SessionLocal()
    try:
        record = session.query(InterviewHistory).filter(InterviewHistory.session_id == session_id).first()
        if not record:
            record = InterviewHistory(session_id=session_id)
            session.add(record)

        if user_id:
            record.user_id = user_id
        record.role_title = role_title
        record.candidate_name = candidate_name
        record.overall_score = overall_score
        record.readiness_assessment = readiness_assessment
        record.readiness_badge_color = readiness_badge_color
        record.turns_count = turns_count
        record.average_wpm = avg_wpm
        record.total_fillers = total_fillers
        record.interview_date = interview_date
        record.report_json = json.dumps(report_data, default=str)
        record.turns_json = json.dumps(turns_data or [], default=str)
        record.role_analysis_json = json.dumps(role_analysis or {}, default=str)
        record.candidate_analysis_json = json.dumps(candidate_analysis or {}, default=str)

        session.commit()
        return True
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to save interview session to database: {e}")
        return False
    finally:
        session.close()

def list_interview_history(user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve summary list of previous interview sessions for the current user."""
    init_db()
    session = SessionLocal()
    try:
        query = session.query(InterviewHistory)
        if user_id:
            query = query.filter(InterviewHistory.user_id == user_id)
        records = (
            query.order_by(desc(InterviewHistory.created_at))
            .limit(limit)
            .all()
        )
        results = []
        for r in records:
            results.append({
                "session_id": r.session_id,
                "user_id": r.user_id,
                "role_title": r.role_title,
                "candidate_name": r.candidate_name,
                "overall_score": r.overall_score,
                "readiness_assessment": r.readiness_assessment,
                "readiness_badge_color": r.readiness_badge_color,
                "turns_count": r.turns_count,
                "average_wpm": r.average_wpm,
                "total_fillers": r.total_fillers,
                "interview_date": r.interview_date,
                "created_at": r.created_at.isoformat() if r.created_at else None
            })
        return results
    except Exception as e:
        logger.error(f"Failed to list interview history: {e}")
        return []
    finally:
        session.close()

def get_interview_history_detail(session_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve full detail including report JSON and turn dialogue for a specific user session."""
    init_db()
    session = SessionLocal()
    try:
        query = session.query(InterviewHistory).filter(InterviewHistory.session_id == session_id)
        if user_id:
            query = query.filter((InterviewHistory.user_id == user_id) | (InterviewHistory.user_id == None))
        r = query.first()
        if not r:
            return None
        data = {
            "session_id": r.session_id,
            "user_id": r.user_id,
            "role_title": r.role_title,
            "candidate_name": r.candidate_name,
            "overall_score": r.overall_score,
            "readiness_assessment": r.readiness_assessment,
            "readiness_badge_color": r.readiness_badge_color,
            "turns_count": r.turns_count,
            "average_wpm": r.average_wpm,
            "total_fillers": r.total_fillers,
            "interview_date": r.interview_date,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "report": json.loads(r.report_json) if r.report_json else None,
            "turns": json.loads(r.turns_json) if r.turns_json else [],
            "role_analysis": json.loads(r.role_analysis_json) if r.role_analysis_json else None,
            "candidate_analysis": json.loads(r.candidate_analysis_json) if r.candidate_analysis_json else None
        }
        return data
    except Exception as e:
        logger.error(f"Failed to get interview history detail: {e}")
        return None
    finally:
        session.close()

def delete_interview_history_record(session_id: str, user_id: Optional[str] = None) -> bool:
    """Delete a specific interview record belonging to the user."""
    init_db()
    session = SessionLocal()
    try:
        query = session.query(InterviewHistory).filter(InterviewHistory.session_id == session_id)
        if user_id:
            query = query.filter(InterviewHistory.user_id == user_id)
        deleted = query.delete(synchronize_session=False)
        session.commit()
        return deleted > 0
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to delete history record: {e}")
        return False
    finally:
        session.close()

def clear_all_interview_history(user_id: Optional[str] = None) -> int:
    """Clear interview history specifically for the current user."""
    init_db()
    session = SessionLocal()
    try:
        query = session.query(InterviewHistory)
        if user_id:
            query = query.filter(InterviewHistory.user_id == user_id)
        count = query.delete(synchronize_session=False)
        session.commit()
        return count
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to clear history: {e}")
        return 0
    finally:
        session.close()

# Auto-initialize database schema on startup
init_db()
