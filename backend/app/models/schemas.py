from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Input Schemas
class DocumentInput(BaseModel):
    text: str = Field(..., description="Raw text of the document")
    filename: Optional[str] = None

class AnalyzeRequest(BaseModel):
    job_description: str
    resume: str
    provider: Optional[str] = "gemini"  # "gemini" or "openai"

# Step 1: Understand the Role
class RoleAnalysis(BaseModel):
    role_title: str
    key_responsibilities: List[str]
    required_skills: List[str]
    preferred_skills: List[str]
    technical_competencies: List[str]
    behavioural_competencies: List[str]
    experience_expectations: str
    important_keywords: List[str]
    important_concepts: List[str]
    key_qualifications: List[str]

# Step 2: Understand the Candidate & Fit
class CandidateAnalysis(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    candidate_skills: List[str]
    relevant_experience: List[str]
    relevant_projects: List[str]
    relevant_achievements: List[str]
    strengths_against_jd: List[str]
    missing_skills: List[str]
    weak_or_insufficient_areas: List[str]
    potential_resume_claims: List[str]  # claims requiring further questioning
    preparation_areas: List[str]

class JobFitAssessment(BaseModel):
    fit_percentage: int
    strong_match: List[str]
    partial_match: List[str]
    missing_weak: List[str]
    summary: str

class AnalysisResponse(BaseModel):
    role_analysis: RoleAnalysis
    candidate_analysis: CandidateAnalysis
    job_fit: JobFitAssessment

# Step 3: Interview Engine Schemas
class SpeechSignals(BaseModel):
    wpm: Optional[int] = 0
    filler_words: Optional[Dict[str, int]] = Field(default_factory=dict)
    filler_count: Optional[int] = 0
    response_duration_seconds: Optional[float] = 0.0
    pause_count: Optional[int] = 0
    confidence_indicators: Optional[str] = "Normal"

class TurnEvaluation(BaseModel):
    turn_score: int  # 0-100
    rating: str  # "Strong", "Adequate", "Vague / Needs Depth", "Weak"
    feedback: str
    what_was_good: str
    what_could_be_better: str
    ideal_direction: str

class InterviewTurn(BaseModel):
    turn_index: int
    level: int  # 1: Screening, 2: Competency, 3: Deep-Dive
    level_name: str
    question: str
    question_intent: str
    candidate_answer: Optional[str] = None
    signals: Optional[SpeechSignals] = None
    evaluation: Optional[TurnEvaluation] = None
    is_counter_question: Optional[bool] = False
    difficulty_tag: Optional[str] = "Medium"

class InterviewState(BaseModel):
    session_id: str
    current_level: int = 1
    current_turn_index: int = 0
    turns: List[InterviewTurn] = []
    accumulated_strengths: List[str] = []
    accumulated_weaknesses: List[str] = []
    topics_covered: List[str] = []
    tested_claims: List[str] = []
    difficulty_level: str = "Standard"  # "Standard", "Challenging", "Foundational"
    is_finished: bool = False
    user_id: Optional[str] = None

class StartInterviewRequest(BaseModel):
    role_analysis: RoleAnalysis
    candidate_analysis: CandidateAnalysis
    job_fit: JobFitAssessment
    interviewer_persona: Optional[str] = "Professional & Rigorous"
    provider: Optional[str] = "gemini"
    user_id: Optional[str] = None

class SubmitAnswerRequest(BaseModel):
    session_id: str
    answer_text: str
    wpm: Optional[int] = 0
    duration_seconds: Optional[float] = 0.0
    filler_words: Optional[Dict[str, int]] = None
    provider: Optional[str] = "gemini"

# Step 4: Interview Performance Report Schemas
class QuestionFeedbackItem(BaseModel):
    question_index: int
    level_name: str
    question: str
    candidate_answer: str
    assessment_score: int
    rating: str
    what_was_good: str
    what_could_be_better: str
    ideal_direction: str

class PreparationGapPriority(BaseModel):
    priority: int  # 1, 2, 3
    title: str
    category: str
    review_topics: List[str]
    action_items: List[str]

class StudyPlanItem(BaseModel):
    day_or_step: str
    focus: str
    tasks: List[str]
    recommended_resources: List[str]

class PerformanceReport(BaseModel):
    session_id: str
    overall_score: int  # 0-100
    readiness_assessment: str  # 🔴 Not Ready, 🟠 Needs Preparation, 🟡 Interview Ready, 🟢 Strong Candidate
    readiness_badge_color: str
    readiness_summary: str
    competency_scores: Dict[str, int]
    # At minimum: Role Fit, Technical Knowledge, Problem Solving, Communication, Confidence, Depth of Understanding, Behavioural Fit
    question_feedbacks: List[QuestionFeedbackItem]
    strengths: List[str]
    weaknesses: List[str]
    preparation_gaps: List[PreparationGapPriority]
    study_plan: List[StudyPlanItem]
    speech_analytics: Dict[str, Any]
    interview_date: Optional[str] = None
