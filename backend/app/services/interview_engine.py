import re
import uuid
from typing import Dict, Any, List, Optional
from app.models.schemas import (
    RoleAnalysis, CandidateAnalysis, JobFitAssessment,
    InterviewTurn, InterviewState, TurnEvaluation, SpeechSignals,
    StartInterviewRequest, SubmitAnswerRequest
)
from app.services.llm_service import llm_service

sessions: Dict[str, Dict[str, Any]] = {}

FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of", "literally"]

LEVEL_NAMES = {
    1: "Level 1 — Screening Interview",
    2: "Level 2 — Competency Interview",
    3: "Level 3 — Deep-Dive Interview"
}

def analyze_speech_text(text: str, duration_sec: float) -> SpeechSignals:
    """Analyze candidate transcript for pace, filler words, and confidence signals dynamically."""
    words = re.findall(r"\b[\w']+\b", text.lower())
    word_count = len(words)
    
    wpm = 0
    if duration_sec > 2:
        wpm = int((word_count / duration_sec) * 60)
    elif word_count > 0:
        wpm = min(160, max(90, word_count * 5))

    filler_counts = {}
    total_fillers = 0
    for filler in FILLER_WORDS:
        pattern = rf"\b{re.escape(filler)}\b"
        matches = len(re.findall(pattern, text.lower()))
        if matches > 0:
            filler_counts[filler] = matches
            total_fillers += matches

    confidence = "Good"
    if total_fillers > 4 or (wpm > 0 and wpm < 85):
        confidence = "Hesitant / Low Confidence"
    elif wpm > 175:
        confidence = "Rushed / Fast Pace"
    elif word_count > 30 and total_fillers <= 2:
        confidence = "High / Confident & Structured"

    return SpeechSignals(
        wpm=wpm,
        filler_words=filler_counts,
        filler_count=total_fillers,
        response_duration_seconds=round(duration_sec, 1),
        pause_count=1 if (duration_sec > 20 and word_count < 25) else 0,
        confidence_indicators=confidence
    )

async def evaluate_answer_with_ai(
    question: str,
    answer: str,
    level: int,
    signals: SpeechSignals,
    role: RoleAnalysis,
    persona: str = "Professional & Rigorous",
    api_key: Optional[str] = None,
    provider: str = "gemini"
) -> TurnEvaluation:
    """Evaluate candidate's actual answer using Gemini AI for technical depth, accuracy, trade-offs, and clarity."""
    prompt = f"""
You are a Staff-level Technical Interviewer evaluating a candidate's response in a live engineering interview.
Interviewer Persona: {persona}
Interview Level: {LEVEL_NAMES.get(level, f'Level {level}')}
Role: {role.role_title}
Key Required Skills: {', '.join(role.required_skills)}
Key Competencies: {', '.join(role.technical_competencies)}

QUESTION ASKED:
"{question}"

CANDIDATE'S ACTUAL ANSWER:
"{answer}"

CANDIDATE DELIVERY SIGNALS:
- Pace: {signals.wpm} words per minute
- Fillers detected: {signals.filler_count} ({', '.join(f'{k}:{v}' for k,v in signals.filler_words.items()) if signals.filler_words else 'None'})
- Duration: {signals.response_duration_seconds}s

EVALUATION RUBRIC:
1. Technical correctness and conceptual accuracy: Did they state anything inaccurate, or correctly describe the architecture/mechanism?
2. Depth & Specificity: Did they cite specific numbers, algorithms, trade-offs, edge cases, or failure recovery? Or was it vague/superficial?
3. Relevance: Did they directly answer the core engineering problem posed in the question?
4. Communication structure: Clear, professional, and well-organized explanation.

Return ONLY a valid JSON object matching this schema:
{{
  "turn_score": integer (0 to 100. 90-100: Exceptional / Staff-level. 80-89: Solid / Senior. 70-79: Acceptable / Mid-level. 55-69: Vague / Needs Depth. Below 55: Incorrect or superficial),
  "rating": "Exceptional" | "Strong & Insightful" | "Adequate" | "Vague / Needs Depth" | "Weak / Inaccurate",
  "what_was_good": "string (1-2 sentences highlighting the exact technical concepts, architectural choices, or metrics the candidate correctly articulated)",
  "what_could_be_better": "string (1-2 sentences providing constructive critique on missing failure modes, unstated trade-offs, or areas needing greater engineering depth)",
  "ideal_direction": "string (concrete technical explanation of how an exemplary candidate would answer this question with architectural rigor)"
}}
"""

    llm_result = await llm_service.generate_json(
        prompt=prompt,
        system_instruction="You are an expert technical interviewer and evaluator. Return strict JSON only.",
        api_key=api_key,
        provider=provider
    )

    if llm_result and "turn_score" in llm_result and "what_was_good" in llm_result:
        score = int(llm_result.get("turn_score", 70))
        score = max(20, min(98, score))
        return TurnEvaluation(
            turn_score=score,
            rating=llm_result.get("rating", "Adequate"),
            feedback=llm_result.get("what_could_be_better", ""),
            what_was_good=llm_result.get("what_was_good", "Addressed key aspects of the question."),
            what_could_be_better=llm_result.get("what_could_be_better", "Include concrete metrics and trade-offs."),
            ideal_direction=llm_result.get("ideal_direction", f"Connect implementation directly to {role.role_title} requirements.")
        )

    # Fallback to dynamic heuristic only if LLM is offline
    return evaluate_answer_dynamically_fallback(question, answer, level, signals, role)

def evaluate_answer_dynamically_fallback(
    question: str,
    answer: str,
    level: int,
    signals: SpeechSignals,
    role: RoleAnalysis
) -> TurnEvaluation:
    """Fallback evaluation if LLM is temporarily unreachable."""
    words = answer.strip().split()
    word_count = len(words)
    lower_ans = answer.lower()

    metrics_matches = re.findall(r"(\d+%\s*|\$\d+|\b\d+\s*(?:ms|seconds|minutes|users|queries|rps)\b|\baccuracy\b|\blatency\b|\bthroughput\b)", answer, re.IGNORECASE)
    has_tradeoff = any(t in lower_ans for t in ["trade-off", "tradeoff", "however", "instead of", "because", "alternative", "bottleneck", "challenge", "drawback", "limitation"])
    role_skills_mentioned = [s for s in role.required_skills if s.lower() in lower_ans]

    score = 65
    if word_count < 15:
        score = 42
        rating = "Weak / Too Brief"
        good = "Touched on the initial concept."
        better = "The answer was extremely brief. In an interview, provide concrete context, actions taken, and technical reasoning."
        direction = f"State the technical setup, your specific contribution, and connect it directly to {role.role_title} requirements."
    elif word_count < 35:
        score = 60
        rating = "Vague / Needs Depth"
        good = f"Mentioned relevant concepts ({', '.join(role_skills_mentioned) if role_skills_mentioned else 'general technologies'})."
        better = "Your answer stated the outcome or tool without explaining the 'how' or justifying your technical choices."
        direction = "Include details on why this approach was selected over alternatives, and what engineering hurdles you faced."
    else:
        score = 75
        if metrics_matches:
            score += 10
        if has_tradeoff:
            score += 8
        if len(role_skills_mentioned) >= 2:
            score += 7
        score = min(96, score)

        if score >= 85:
            rating = "Strong & Insightful"
            good = f"Clear technical explanation citing {' and '.join(metrics_matches[:2]) if metrics_matches else 'specific implementation details'}."
            better = "Continue to highlight production reliability, error handling, or latency constraints under scale."
            direction = "This response effectively communicated technical depth. Emphasize how this applies to edge cases."
        else:
            rating = "Adequate"
            good = "Good high-level understanding of the subject matter."
            better = "Quantify the outcome with concrete metrics and discuss edge cases you resolved."
            direction = f"Connect your technical solution directly to the {role.role_title} engineering requirements."

    return TurnEvaluation(
        turn_score=score,
        rating=rating,
        feedback=better,
        what_was_good=good,
        what_could_be_better=better,
        ideal_direction=direction
    )

async def generate_initial_question(role: RoleAnalysis, cand: CandidateAnalysis, persona: str, api_key: Optional[str] = None, provider: str = "gemini") -> InterviewTurn:
    """Generate first Level 1 Screening question referencing candidate's actual resume projects/skills."""
    cand_name = cand.candidate_name or "Candidate"
    
    # Try LLM first for a 100% personalized question
    prompt = f"""
You are an interviewer conducting a Level 1 Screening Interview for the role of {role.role_title}.
Interviewer Persona: {persona}

Candidate Name: {cand_name}
Candidate Resume Projects:
{chr(10).join(f"- {p}" for p in cand.relevant_projects)}

Candidate Skills: {', '.join(cand.candidate_skills)}
JD Role: {role.role_title}
JD Key Responsibilities: {', '.join(role.key_responsibilities[:2])}

TASK:
Craft a natural, highly personalized opening screening question for {cand_name}.
Instead of a generic "Tell me about yourself", directly reference one of their ACTUAL projects or experiences from the resume list above.
Ask them to explain the problem it solved, their specific technical contribution, and why they chose that approach.

Return ONLY a JSON object:
{{
  "question": "string (the natural opening question to speak to the candidate)",
  "question_intent": "Evaluate resume authenticity, communication clarity, and candidate contribution to their project."
}}
"""
    result = await llm_service.generate_json(
        prompt=prompt,
        system_instruction="You are an expert technical interviewer. Return strict JSON only.",
        api_key=api_key,
        provider=provider
    )

    if result and "question" in result:
        return InterviewTurn(
            turn_index=0,
            level=1,
            level_name=LEVEL_NAMES[1],
            question=result["question"],
            question_intent=result.get("question_intent", "Evaluate candidate project ownership and communication."),
            difficulty_tag="Screening"
        )

    # Dynamic fallback using actual parsed project from resume
    actual_project = cand.relevant_projects[0] if cand.relevant_projects else (f"your experience with {cand.candidate_skills[0]}" if cand.candidate_skills else "your technical background")
    
    question = (
        f"Hello {cand_name}! To begin our screening interview for the {role.role_title} role, "
        f"I saw on your resume that you worked on '{actual_project}'. "
        f"Could you walk me through the specific problem you were tackling, your technical role, and why you selected that specific approach?"
    )
    
    return InterviewTurn(
        turn_index=0,
        level=1,
        level_name=LEVEL_NAMES[1],
        question=question,
        question_intent="Evaluate resume authenticity, candidate ownership, and practical experience.",
        difficulty_tag="Screening"
    )

async def start_interview_session(req: StartInterviewRequest) -> Dict[str, Any]:
    """Initialize interview session state and first question."""
    session_id = str(uuid.uuid4())
    
    initial_turn = await generate_initial_question(
        role=req.role_analysis,
        cand=req.candidate_analysis,
        persona=req.interviewer_persona or "Professional & Rigorous",
        api_key=req.api_key,
        provider=req.provider
    )
    
    state = InterviewState(
        session_id=session_id,
        user_id=req.user_id,
        current_level=1,
        current_turn_index=0,
        turns=[initial_turn],
        accumulated_strengths=[],
        accumulated_weaknesses=[],
        topics_covered=[req.role_analysis.required_skills[0] if req.role_analysis.required_skills else "General"],
        tested_claims=[],
        difficulty_level="Standard"
    )
    
    sessions[session_id] = {
        "state": state,
        "user_id": req.user_id,
        "role_analysis": req.role_analysis,
        "candidate_analysis": req.candidate_analysis,
        "job_fit": req.job_fit,
        "persona": req.interviewer_persona,
        "api_key": req.api_key
    }
    
    return {
        "session_id": session_id,
        "current_level": 1,
        "level_name": LEVEL_NAMES[1],
        "question": initial_turn.question,
        "turn_index": 0,
        "total_expected_turns": 6
    }

async def process_candidate_turn(req: SubmitAnswerRequest) -> Dict[str, Any]:
    """Process candidate's voice/text answer, evaluate it, adaptively select next question or advance levels."""
    if req.session_id not in sessions:
        raise ValueError(f"Session {req.session_id} not found.")
        
    session_data = sessions[req.session_id]
    state: InterviewState = session_data["state"]
    role: RoleAnalysis = session_data["role_analysis"]
    cand: CandidateAnalysis = session_data["candidate_analysis"]
    persona: str = session_data.get("persona", "Professional & Rigorous")
    active_api_key: Optional[str] = req.api_key or session_data.get("api_key")
    if req.api_key:
        session_data["api_key"] = req.api_key
    
    current_turn = state.turns[-1]
    current_turn.candidate_answer = req.answer_text
    
    # 1. Analyze speech signals
    signals = analyze_speech_text(req.answer_text, req.duration_seconds or 0.0)
    current_turn.signals = signals
    
    # 2. Evaluate turn using Gemini AI
    turn_eval = await evaluate_answer_with_ai(
        question=current_turn.question,
        answer=req.answer_text,
        level=current_turn.level,
        signals=signals,
        role=role,
        persona=persona,
        api_key=active_api_key,
        provider=req.provider
    )
    current_turn.evaluation = turn_eval
    
    # Track strengths & weaknesses directly from AI evaluation
    if turn_eval.turn_score >= 80:
        state.accumulated_strengths.append(f"Turn {state.current_turn_index+1}: {turn_eval.what_was_good}")
        if state.difficulty_level == "Foundational":
            state.difficulty_level = "Standard"
        elif state.difficulty_level == "Standard" and current_turn.level >= 2:
            state.difficulty_level = "Challenging"
    else:
        state.accumulated_weaknesses.append(f"Turn {state.current_turn_index+1}: {turn_eval.what_could_be_better}")
        if turn_eval.turn_score < 60:
            state.difficulty_level = "Foundational"

    turn_count = len(state.turns)
    next_level = state.current_level
    
    # Stop condition: 6 total turns
    if turn_count >= 6:
        state.is_finished = True
        return {
            "session_id": req.session_id,
            "is_finished": True,
            "last_turn_evaluation": turn_eval,
            "signals": signals,
            "message": "Interview completed! You can now generate the comprehensive performance report."
        }

    # Transition levels:
    # Turns 0, 1 -> Level 1 (Screening)
    # Turns 2, 3 -> Level 2 (Competency)
    # Turns 4, 5 -> Level 3 (Deep-Dive)
    if turn_count == 2:
        next_level = 2
    elif turn_count == 4:
        next_level = 3
    state.current_level = next_level

    # 3. Generate adaptive next question (Dynamic logic)
    next_question, next_intent, is_counter, diff_tag = await generate_adaptive_next_question(
        role=role,
        cand=cand,
        state=state,
        last_turn=current_turn,
        next_level=next_level,
        persona=persona,
        api_key=active_api_key,
        provider=req.provider
    )

    next_turn = InterviewTurn(
        turn_index=turn_count,
        level=next_level,
        level_name=LEVEL_NAMES[next_level],
        question=next_question,
        question_intent=next_intent,
        is_counter_question=is_counter,
        difficulty_tag=diff_tag
    )
    state.turns.append(next_turn)
    state.current_turn_index = turn_count

    return {
        "session_id": req.session_id,
        "is_finished": False,
        "turn_index": turn_count,
        "current_level": next_level,
        "level_name": LEVEL_NAMES[next_level],
        "question": next_question,
        "question_intent": next_intent,
        "is_counter_question": is_counter,
        "difficulty_tag": diff_tag,
        "last_turn_evaluation": turn_eval,
        "signals": signals
    }

async def generate_adaptive_next_question(
    role: RoleAnalysis,
    cand: CandidateAnalysis,
    state: InterviewState,
    last_turn: InterviewTurn,
    next_level: int,
    persona: str = "Professional & Rigorous",
    api_key: Optional[str] = None,
    provider: str = "gemini"
):
    """Generate dynamic follow-up question or probe using LLM with strictly personalized dynamic fallback."""
    # Build conversation context for LLM
    history_snippets = []
    for t in state.turns:
        if t.candidate_answer:
            history_snippets.append(f"AI: {t.question}\nCandidate: {t.candidate_answer}")
    history_str = "\n\n".join(history_snippets)

    prompt = f"""
You are conducting an adaptive technical interview for the role of {role.role_title}.
Interviewer Persona: {persona}
Current Level: {LEVEL_NAMES[next_level]}
Interviewer Difficulty Mode: {state.difficulty_level}

Role Requirements:
Required Skills: {', '.join(role.required_skills)}
Key Competencies: {', '.join(role.technical_competencies)}

Candidate Resume Summary:
Name: {cand.candidate_name}
Skills: {', '.join(cand.candidate_skills[:8])}
Projects: {'; '.join(cand.relevant_projects[:3])}
Claims flagged for probing: {'; '.join(cand.potential_resume_claims[:2])}

Interview Transcript So Far:
{history_str}

Candidate Just Answered:
"{last_turn.candidate_answer}"

INSTRUCTIONS FOR LEVEL {next_level} ({LEVEL_NAMES[next_level]}):
- If candidate's answer was vague, brief, or lacked specifics, IMMEDIATELY challenge them with a counter-question probing the 'how', 'why', or technical trade-offs.
- If candidate made a strong point or cited a metric, probe their validation methodology, edge cases, failure modes, or baseline.
- If Level 2 (Competency): Probe practical architectural application of {role.required_skills[1] if len(role.required_skills) > 1 else role.required_skills[0]} and system reliability.
- If Level 3 (Deep-Dive): Challenge assumptions, ask why they picked their chosen tech stack over simpler alternatives, or introduce realistic system constraints (concurrency, data corruption, latency).
- NEVER ask a generic or predetermined question. You must speak directly to what the candidate literally just said.

Return JSON:
{{
  "question": "string (the natural spoken question from the interviewer)",
  "question_intent": "string (what this specific question evaluates)",
  "is_counter_question": true/false,
  "difficulty_tag": "Foundational" | "Standard" | "Challenging"
}}
"""

    result = await llm_service.generate_json(
        prompt=prompt,
        system_instruction="You are a realistic senior technical interviewer. Be dynamic, conversational, and direct.",
        api_key=api_key,
        provider=provider
    )

    if result and "question" in result:
        return (
            result.get("question"),
            result.get("question_intent", "Evaluate technical depth and reasoning."),
            result.get("is_counter_question", False),
            result.get("difficulty_tag", state.difficulty_level)
        )

    # Dynamic Fallback: Construct question directly from candidate's actual words and resume details
    last_ans = (last_turn.candidate_answer or "").strip()
    words = re.findall(r"\b[A-Za-z0-9\+\#\.\-]+\b", last_ans)
    
    # Find any technical term mentioned in candidate's response
    mentioned_tech = [w for w in words if any(s.lower() == w.lower() for s in cand.candidate_skills + role.required_skills)]
    
    # Find any numbers or metric mentioned in candidate's response
    metrics_in_ans = re.findall(r"(\d+%\s*|\$\d+|\b\d+\b)", last_ans)

    if next_level == 1:
        # Level 1 Screening follow-up: probe practical experience with a core skill from the JD
        skill_to_probe = role.required_skills[1] if len(role.required_skills) > 1 else role.required_skills[0]
        if mentioned_tech:
            return (
                f"You mentioned working with {mentioned_tech[0]}. In your experience with {mentioned_tech[0]}, "
                f"what was the biggest architectural hurdle or unexpected failure you encountered, and how did you resolve it?",
                f"Assess real-world troubleshooting and practical depth with {mentioned_tech[0]}.",
                False,
                "Standard"
            )
        else:
            return (
                f"Looking at the requirements for {role.role_title}, hands-on experience with {skill_to_probe} is essential. "
                f"Could you share a practical example where you applied {skill_to_probe}, and how you structured your solution?",
                f"Assess core competence with {skill_to_probe}.",
                False,
                "Standard"
            )
            
    elif next_level == 2:
        # Level 2 Competency: Problem solving & decision making
        comp = role.technical_competencies[0] if role.technical_competencies else f"{role.required_skills[0]} design"
        if len(words) < 25:
            # Candidate was brief; challenge them
            return (
                f"Your explanation touched on the outcome, but for {comp}, we need deeper engineering rationale. "
                f"Can you explain step-by-step how the data flows through your system, and what happens when an error occurs?",
                "Probe engineering rationale and error handling.",
                True,
                "Challenging"
            )
        else:
            return (
                f"In production environments for {role.role_title}, we often encounter scaling constraints. "
                f"If the workload on the system you just described increased by 50x, where would the primary bottleneck occur and how would you redesign it?",
                "Evaluate scalability, concurrency, and bottleneck diagnosis.",
                False,
                "Challenging" if state.difficulty_level == "Challenging" else "Standard"
            )
            
    else:
        # Level 3 Deep-Dive: Challenge weak claims, probe metrics, ask why/how
        if metrics_in_ans:
            return (
                f"You specifically highlighted '{metrics_in_ans[0]}' in your explanation. "
                f"How exactly did you measure that baseline, what evaluation dataset was used, and what potential biases or edge cases could invalidate that measurement?",
                "Deep-dive challenge on metric validity and experimental rigor.",
                True,
                "Challenging"
            )
        elif cand.potential_resume_claims:
            claim = cand.potential_resume_claims[0]
            return (
                f"Looking at your resume claim: '{claim}'. "
                f"If a customer or production system presented corrupt or out-of-distribution inputs to that system, what failure modes would occur and how does your architecture defend against them?",
                "Deep-dive probe of resume claim robustness and production failure modes.",
                True,
                "Challenging"
            )
        else:
            return (
                "If you had to rebuild that architecture from scratch today with what you now know, what fundamental decision would you change, and why?",
                "Evaluate critical self-reflection and engineering trade-off maturity.",
                True,
                "Challenging"
            )
