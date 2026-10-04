from typing import Dict, Any, List, Optional
from datetime import datetime
from app.models.schemas import (
    PerformanceReport, QuestionFeedbackItem, PreparationGapPriority,
    StudyPlanItem, RoleAnalysis, CandidateAnalysis, JobFitAssessment, InterviewTurn
)
from app.services.interview_engine import sessions
from app.services.llm_service import llm_service

REPORT_LLM_PROMPT = """
You are an expert Technical Interview Evaluator.
Given the full interview transcript and metadata below, generate an objective, highly detailed performance evaluation.
Do NOT use generic feedback. Make everything strictly specific to the candidate's actual answers, the role of {role_title}, and the required skills.

Role: {role_title}
Candidate: {candidate_name}
JD Required Skills: {required_skills}

Interview Transcript:
{transcript_text}

Return a valid JSON object matching EXACTLY this structure:
{{
  "overall_score": 78,
  "readiness_assessment": "Interview Ready", 
  "readiness_badge_color": "yellow",
  "readiness_summary": "Detailed summary explaining why this readiness rating was awarded based on candidate's answers.",
  "competency_scores": {{
    "Role Fit": 82,
    "Technical Knowledge": 75,
    "Problem Solving": 78,
    "Communication": 80,
    "Confidence": 74,
    "Depth of Understanding": 72,
    "Behavioural Fit": 85
  }},
  "strengths": [
    "Specific technical or behavioral strength demonstrated in this interview", ...
  ],
  "weaknesses": [
    "Specific technical or communication weakness identified in candidate answers", ...
  ],
  "preparation_gaps": [
    {{
      "priority": 1,
      "title": "Priority 1 Technical Gap for this role",
      "category": "Technical Core",
      "review_topics": ["Specific Topic A", "Specific Topic B", "Specific Topic C"],
      "action_items": ["Actionable step 1", "Actionable step 2"]
    }},
    {{
      "priority": 2,
      "title": "Priority 2 Engineering / Practical Gap",
      "category": "Engineering Rigor",
      "review_topics": ["Specific Topic D", "Specific Topic E"],
      "action_items": ["Actionable step 3"]
    }},
    {{
      "priority": 3,
      "title": "Priority 3 Behavioral & Communication Gap",
      "category": "Communication",
      "review_topics": ["STAR Method", "Quantifying Business Impact"],
      "action_items": ["Prepare structured examples"]
    }}
  ],
  "study_plan": [
    {{
      "day_or_step": "Day 1-2",
      "focus": "Foundations & Priority 1 Gaps",
      "tasks": ["Task 1", "Task 2"],
      "recommended_resources": ["Resource 1", "Resource 2"]
    }},
    {{
      "day_or_step": "Day 3-4",
      "focus": "Scenario & Trade-off Drills",
      "tasks": ["Task 3", "Task 4"],
      "recommended_resources": ["Resource 3"]
    }},
    {{
      "day_or_step": "Day 5",
      "focus": "Behavioral Polish & Re-simulation",
      "tasks": ["Task 5"],
      "recommended_resources": ["STAR Framework"]
    }}
  ]
}}
"""

def generate_dynamic_skill_topics(skill: str) -> List[str]:
    """Generate relevant review topics dynamically based on the skill name."""
    s = skill.lower()
    if any(k in s for k in ["react", "frontend", "vue", "angular", "javascript", "typescript", "css"]):
        return [
            f"{skill} component lifecycle & state management",
            "Virtual DOM & rendering optimization",
            "Asynchronous state, caching & API integration",
            "Error boundaries and browser compatibility"
        ]
    elif any(k in s for k in ["python", "django", "fastapi", "flask", "backend", "api", "node"]):
        return [
            f"{skill} architectural patterns and async concurrency",
            "API schema validation, routing, and middleware",
            "Database connection pooling and query optimization",
            "Error handling, logging, and unit testing"
        ]
    elif any(k in s for k in ["rag", "llm", "ai", "machine learning", "nlp", "pytorch", "embeddings", "vector"]):
        return [
            f"{skill} pipeline design and context retrieval",
            "Vector embeddings, distance metrics, and indexing",
            "Model evaluation metrics (Precision, Recall, ROC-AUC, F1)",
            "Latency budgeting and prompt optimization"
        ]
    elif any(k in s for k in ["sql", "postgres", "database", "mongodb"]):
        return [
            f"{skill} indexing strategies and execution plans",
            "ACID transactions, isolation levels, and locking",
            "Schema normalization vs denormalization trade-offs",
            "Connection management and backup strategies"
        ]
    elif any(k in s for k in ["docker", "kubernetes", "cloud", "aws", "devops"]):
        return [
            f"{skill} containerization best practices and multi-stage builds",
            "Cluster orchestration, ingress, and service discovery",
            "CI/CD deployment pipelines and automated rollbacks",
            "Resource limits, health checks, and monitoring"
        ]
    else:
        return [
            f"{skill} core fundamentals and design principles",
            f"Production edge cases and performance tuning in {skill}",
            f"Error recovery and fault tolerance with {skill}",
            f"Testing strategies and validation benchmarks"
        ]

def compute_local_report(
    session_id: str,
    role: RoleAnalysis,
    cand: CandidateAnalysis,
    turns: List[InterviewTurn]
) -> PerformanceReport:
    """Generate comprehensive report dynamically using turn evaluations and speech telemetry."""
    valid_turns = [t for t in turns if t.candidate_answer]
    
    turn_scores = [t.evaluation.turn_score if t.evaluation else 70 for t in valid_turns]
    avg_turn_score = int(sum(turn_scores) / len(turn_scores)) if turn_scores else 70

    total_fillers = sum(t.signals.filler_count for t in valid_turns if t.signals)
    wpm_list = [t.signals.wpm for t in valid_turns if t.signals and t.signals.wpm > 0]
    avg_wpm = int(sum(wpm_list) / len(wpm_list)) if wpm_list else 125
    
    filler_breakdown = {}
    for t in valid_turns:
        if t.signals and t.signals.filler_words:
            for k, v in t.signals.filler_words.items():
                filler_breakdown[k] = filler_breakdown.get(k, 0) + v

    comm_score = 80
    if total_fillers > 8:
        comm_score -= 10
    elif total_fillers <= 2:
        comm_score += 5
    if avg_wpm < 90 or avg_wpm > 170:
        comm_score -= 5
    comm_score = max(50, min(95, comm_score))

    conf_score = 78
    if any(t.signals and "Hesitant" in t.signals.confidence_indicators for t in valid_turns if t.signals):
        conf_score -= 8
    elif all(t.signals and "High" in t.signals.confidence_indicators for t in valid_turns if t.signals):
        conf_score += 8
    conf_score = max(50, min(95, conf_score))

    tech_knowledge = min(95, max(45, int(avg_turn_score * 0.95 + 4)))
    depth_understanding = min(95, max(40, int(avg_turn_score * 0.90 + 2)))
    problem_solving = min(95, max(50, int(avg_turn_score * 0.92 + 5)))
    role_fit = min(95, max(55, int(avg_turn_score * 0.94 + 5)))
    behavioural_fit = min(95, max(60, int((comm_score + role_fit) / 2)))

    overall_score = int(
        (avg_turn_score * 0.40) +
        (tech_knowledge * 0.20) +
        (comm_score * 0.15) +
        (depth_understanding * 0.15) +
        (problem_solving * 0.10)
    )
    overall_score = max(35, min(98, overall_score))

    # Readiness scale
    if overall_score >= 85:
        readiness = "🟢 Strong Candidate"
        badge_color = "green"
        summary = f"Candidate demonstrates strong readiness for the {role.role_title} role. Demonstrated solid grasp of technical competencies, clear articulation, and resilience under adaptive probing."
    elif overall_score >= 72:
        readiness = "🟡 Interview Ready"
        badge_color = "yellow"
        summary = f"Candidate is prepared to attempt the {role.role_title} interview. Good core understanding; would benefit from practicing metric quantification and deeper system edge cases."
    elif overall_score >= 58:
        readiness = "🟠 Needs Preparation"
        badge_color = "orange"
        summary = f"Some important preparation gaps remain for the {role.role_title} position. Foundational concepts are present, but answers require greater architectural depth and justification."
    else:
        readiness = "🔴 Not Ready"
        badge_color = "red"
        summary = f"Significant preparation required across core {role.role_title} skills and structured communication before attempting live interviews."

    q_feedbacks = []
    for i, t in enumerate(valid_turns):
        ev = t.evaluation
        q_feedbacks.append(QuestionFeedbackItem(
            question_index=i + 1,
            level_name=t.level_name,
            question=t.question,
            candidate_answer=t.candidate_answer or "",
            assessment_score=ev.turn_score if ev else 70,
            rating=ev.rating if ev else "Adequate",
            what_was_good=ev.what_was_good if ev else "Addressed core themes of the question.",
            what_could_be_better=ev.what_could_be_better if ev else "Provide more concrete metrics and architectural justification.",
            ideal_direction=ev.ideal_direction if ev else "A stronger answer should cite baseline numbers, trade-offs, and failure handling."
        ))

    # Dynamically extract skills from the actual role
    primary_skill = role.required_skills[0] if role.required_skills else "Core Domain"
    sec_skill = role.required_skills[1] if len(role.required_skills) > 1 else (role.preferred_skills[0] if role.preferred_skills else "Engineering Design")
    
    strengths = [
        f"Demonstrated working knowledge in {primary_skill}.",
        f"Articulated past project work and problem-solving approach.",
        f"Pacing was measured ({avg_wpm} words per minute average)."
    ]
    if overall_score >= 75:
        strengths.append(f"Showed adaptability when challenged on technical decisions.")

    weaknesses = [
        "Tendency to describe implementations without quantifying the impact or comparative metrics.",
        f"Could provide deeper justifications for architectural choices in {sec_skill} under edge-case scenarios."
    ]
    if total_fillers > 5:
        weaknesses.append(f"Used filler words ({total_fillers} detected across turns: {', '.join(filler_breakdown.keys())}).")

    prep_gaps = [
        PreparationGapPriority(
            priority=1,
            title=f"{primary_skill} Architecture & Core Principles",
            category="Technical Core",
            review_topics=generate_dynamic_skill_topics(primary_skill),
            action_items=[
                f"Build a miniature prototype or benchmark demonstrating hands-on mastery in {primary_skill}",
                "Prepare concise explanations for why specific architectural parameters were selected"
            ]
        ),
        PreparationGapPriority(
            priority=2,
            title=f"{sec_skill} & System Reliability",
            category="Engineering Rigor",
            review_topics=generate_dynamic_skill_topics(sec_skill),
            action_items=[
                "Document concrete numbers (latency, speedup %, throughput) for each resume project",
                "Practice diagramming system boundaries and failure recovery pipelines"
            ]
        ),
        PreparationGapPriority(
            priority=3,
            title="Structured Communication (STAR Framework)",
            category="Behavioural Fit",
            review_topics=[
                "Situation: Context of the problem",
                "Task: Your specific ownership and role",
                "Action: Technical steps and engineering decisions taken",
                "Result: Quantifiable outcome and lessons learned"
            ],
            action_items=[
                "Structure 3 core stories using STAR: handling a critical bug, resolving team debate, delivering on deadline",
                "Practice speaking in 60-90 second timed responses to minimize filler words"
            ]
        )
    ]

    study_plan = [
        StudyPlanItem(
            day_or_step="Day 1-2",
            focus=f"Deepen {primary_skill} Foundations & Metrics",
            tasks=[
                f"Review priority 1 review topics for {primary_skill}",
                "Document concrete numbers and baselines for your top resume projects"
            ],
            recommended_resources=[f"Official {primary_skill} Documentation", "Engineering Best Practices"]
        ),
        StudyPlanItem(
            day_or_step="Day 3-4",
            focus=f"Scenario & Edge-Case Drills in {sec_skill}",
            tasks=[
                f"Simulate system failure scenarios and bottlenecks for {sec_skill}",
                "Practice defending technical trade-offs against critical counter-questions"
            ],
            recommended_resources=["System Design Primer", "Architecture Case Studies"]
        ),
        StudyPlanItem(
            day_or_step="Day 5",
            focus="STAR Behavioral Polish & Re-Simulation",
            tasks=[
                "Rehearse STAR framework answers aloud with voice recording",
                "Run another mock interview on the simulator to verify score improvement"
            ],
            recommended_resources=["STAR Behavioral Framework Guide"]
        )
    ]

    speech_analytics = {
        "average_wpm": avg_wpm,
        "total_filler_words": total_fillers,
        "filler_words_breakdown": filler_breakdown,
        "pace_rating": "Optimal (120-150 WPM)" if 115 <= avg_wpm <= 155 else ("A bit slow" if avg_wpm < 115 else "A bit fast"),
        "confidence_index": f"{conf_score}%"
    }

    return PerformanceReport(
        session_id=session_id,
        overall_score=overall_score,
        readiness_assessment=readiness,
        readiness_badge_color=badge_color,
        readiness_summary=summary,
        competency_scores={
            "Role Fit": role_fit,
            "Technical Knowledge": tech_knowledge,
            "Problem Solving": problem_solving,
            "Communication": comm_score,
            "Confidence": conf_score,
            "Depth of Understanding": depth_understanding,
            "Behavioural Fit": behavioural_fit
        },
        question_feedbacks=q_feedbacks,
        strengths=strengths,
        weaknesses=weaknesses,
        preparation_gaps=prep_gaps,
        study_plan=study_plan,
        speech_analytics=speech_analytics,
        interview_date=datetime.now().strftime("%B %d, %Y")
    )

async def generate_interview_report(session_id: str, api_key: Optional[str] = None, provider: str = "gemini") -> PerformanceReport:
    """Generate final comprehensive report dynamically combining telemetry with LLM evaluation synthesis."""
    if session_id not in sessions:
        raise ValueError(f"Session {session_id} not found.")

    session_data = sessions[session_id]
    state = session_data["state"]
    role = session_data["role_analysis"]
    cand = session_data["candidate_analysis"]
    turns = state.turns

    active_key = api_key or session_data.get("api_key")
    local_report = compute_local_report(session_id, role, cand, turns)

    # If LLM key is available, enrich with LLM insights
    transcript_lines = []
    for i, t in enumerate(turns):
        if t.candidate_answer:
            transcript_lines.append(f"Turn {i+1} [{t.level_name}]:")
            transcript_lines.append(f"Q: {t.question}")
            transcript_lines.append(f"A: {t.candidate_answer}\n")
    
    transcript_text = "\n".join(transcript_lines)
    if transcript_text:
        prompt = REPORT_LLM_PROMPT.format(
            role_title=role.role_title,
            candidate_name=cand.candidate_name or "Candidate",
            required_skills=", ".join(role.required_skills),
            transcript_text=transcript_text
        )
        llm_data = await llm_service.generate_json(
            prompt=prompt,
            system_instruction="You are an expert interview evaluator.",
            api_key=active_key,
            provider=provider
        )
        if llm_data and "overall_score" in llm_data and "competency_scores" in llm_data:
            try:
                local_report.overall_score = llm_data.get("overall_score", local_report.overall_score)
                local_report.readiness_assessment = llm_data.get("readiness_assessment", local_report.readiness_assessment)
                local_report.readiness_badge_color = llm_data.get("readiness_badge_color", local_report.readiness_badge_color)
                local_report.readiness_summary = llm_data.get("readiness_summary", local_report.readiness_summary)
                if "competency_scores" in llm_data:
                    local_report.competency_scores = llm_data["competency_scores"]
                if "strengths" in llm_data and len(llm_data["strengths"]) > 0:
                    local_report.strengths = llm_data["strengths"]
                if "weaknesses" in llm_data and len(llm_data["weaknesses"]) > 0:
                    local_report.weaknesses = llm_data["weaknesses"]
                if "preparation_gaps" in llm_data and len(llm_data["preparation_gaps"]) > 0:
                    try:
                        local_report.preparation_gaps = [PreparationGapPriority(**g) for g in llm_data["preparation_gaps"]]
                    except Exception:
                        pass
                if "study_plan" in llm_data and len(llm_data["study_plan"]) > 0:
                    try:
                        local_report.study_plan = [StudyPlanItem(**p) for p in llm_data["study_plan"]]
                    except Exception:
                        pass
            except Exception:
                pass

    # Automatically persist to Cloud / SQLite database
    try:
        from app.db.database import save_interview_session
        user_id = session_data.get("user_id")
        save_interview_session(
            session_id=session_id,
            role_title=role.role_title,
            candidate_name=cand.candidate_name or "Candidate",
            overall_score=local_report.overall_score,
            readiness_assessment=local_report.readiness_assessment,
            readiness_badge_color=local_report.readiness_badge_color,
            report_data=local_report.model_dump(),
            turns_data=[t.model_dump() for t in turns],
            role_analysis=role.model_dump(),
            candidate_analysis=cand.model_dump(),
            user_id=user_id
        )
    except Exception as dbe:
        print(f"Database save notice: {dbe}")

    return local_report
