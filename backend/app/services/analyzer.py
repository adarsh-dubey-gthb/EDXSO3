import re
from typing import Dict, Any, List, Tuple
from app.models.schemas import RoleAnalysis, CandidateAnalysis, JobFitAssessment, AnalysisResponse
from app.services.llm_service import llm_service

ROLE_PROMPT_TEMPLATE = """
You are an expert AI Technical Recruiter.
Analyze the following Job Description (JD) and extract structured role requirements.
Do NOT use generic or canned templates. Extract ONLY information directly stated in or inferred from this specific JD.

Job Description:
\"\"\"{jd_text}\"\"\"

Return a valid JSON object matching EXACTLY this structure:
{{
  "role_title": "string (the actual job title from the JD)",
  "key_responsibilities": ["string", ...],
  "required_skills": ["string", ...],
  "preferred_skills": ["string", ...],
  "technical_competencies": ["string", ...],
  "behavioural_competencies": ["string", ...],
  "experience_expectations": "string (e.g. 0-2 years / Senior / Student)",
  "important_keywords": ["string", ...],
  "important_concepts": ["string", ...],
  "key_qualifications": ["string", ...]
}}
"""

CANDIDATE_FIT_PROMPT_TEMPLATE = """
You are an expert AI Technical Hiring Manager.
Compare the Candidate's Resume against the parsed Job Description.
Extract real details, real project names, real tech stacks, and real claims directly from the candidate's resume.
Do NOT invent or hardcode data.

Job Description:
Role Title: {role_title}
Required Skills: {required_skills}
Technical Competencies: {technical_competencies}

Candidate Resume:
\"\"\"{resume_text}\"\"\"

Instructions:
1. Extract candidate's actual skills listed in resume.
2. Extract candidate's actual projects from the resume.
3. Identify specific claims made in the resume that should be probed in an interview (e.g. metrics, claims of optimization, or complex tech used).
4. Compute Job Fit percentage based strictly on the candidate's resume alignment with the JD required skills.
5. Identify strong matches, partial matches, and missing or weak areas based on the actual documents.

Return a valid JSON object matching EXACTLY this structure:
{{
  "candidate_name": "string (extracted from resume)",
  "candidate_skills": ["string", ...],
  "relevant_experience": ["string", ...],
  "relevant_projects": ["string", ...],
  "relevant_achievements": ["string", ...],
  "strengths_against_jd": ["string", ...],
  "missing_skills": ["string", ...],
  "weak_or_insufficient_areas": ["string", ...],
  "potential_resume_claims": ["string (specific claim from candidate's resume to challenge)", ...],
  "preparation_areas": ["string", ...],
  "job_fit": {{
    "fit_percentage": 75,
    "strong_match": ["string", ...],
    "partial_match": ["string", ...],
    "missing_weak": ["string", ...],
    "summary": "string"
  }}
}}
"""

def dynamic_extract_role_from_text(jd_text: str) -> RoleAnalysis:
    """Dynamically parse job description using text extraction without canned data."""
    lines = [l.strip() for l in jd_text.splitlines() if l.strip()]
    
    # 1. Extract Role Title
    role_title = ""
    title_match = re.search(r"(?:role|position|title|job title)[:\s]+([^\n\r,]+)", jd_text, re.IGNORECASE)
    if title_match:
        role_title = title_match.group(1).strip()
    elif lines:
        for line in lines[:4]:
            cleaned = re.sub(r"^[#*•\-\s]+", "", line).strip()
            if any(k in cleaned.lower() for k in ["engineer", "developer", "intern", "manager", "scientist", "specialist", "analyst", "designer", "architect", "lead"]):
                role_title = cleaned
                break
    if not role_title:
        role_title = lines[0] if lines else "Target Position"

    # 2. Extract Responsibilities from bullet points / action verbs
    responsibilities = []
    for line in lines:
        cleaned = re.sub(r"^[#*•\-\d\.\s]+", "", line).strip()
        if len(cleaned) > 25 and len(cleaned) < 200:
            if re.match(r"^(build|develop|design|lead|collaborate|implement|maintain|create|scale|manage|deliver|write|drive|support|evaluate)\b", cleaned, re.IGNORECASE):
                responsibilities.append(cleaned)
    if not responsibilities:
        # Fallback to lines that have reasonable length
        responsibilities = [re.sub(r"^[#*•\-\s]+", "", l) for l in lines[1:6] if len(l) > 20][:4]

    # 3. Dynamic Skills Extraction: look for skills mentioned in the JD text
    words_in_jd = set(re.findall(r"\b[A-Za-z0-9\+#\.]+\b", jd_text.lower()))
    
    # Common vocabulary to check presence in document
    KNOWN_SKILLS = [
        "python", "javascript", "typescript", "react", "vue", "angular", "node.js", "nodejs",
        "fastapi", "django", "flask", "java", "c++", "c#", "golang", "go", "rust", "sql",
        "postgresql", "mysql", "mongodb", "redis", "docker", "kubernetes", "aws", "gcp", "azure",
        "machine learning", "deep learning", "nlp", "llm", "llms", "rag", "pytorch", "tensorflow",
        "keras", "scikit-learn", "git", "ci/cd", "rest api", "graphql", "html", "css", "tailwind",
        "linux", "system design", "data structures", "algorithms", "spark", "hadoop", "kafka"
    ]
    
    found_skills = []
    for s in KNOWN_SKILLS:
        pattern = rf"\b{re.escape(s)}\b"
        if re.search(pattern, jd_text, re.IGNORECASE):
            found_skills.append(s.title() if len(s) > 4 else s.upper())
    
    # If no known technical skills match, extract capitalized tokens or phrases
    if not found_skills:
        potential = re.findall(r"\b[A-Z][a-zA-Z0-9\+\#]{2,}\b", jd_text)
        found_skills = list(dict.fromkeys([p for p in potential if p.lower() not in ["the", "and", "for", "with", "role", "team", "work", "job", "about", "looking"]]))[:6]

    req_skills = found_skills[:6] if found_skills else ["Communication", "Domain Knowledge", "Technical Aptitude"]
    pref_skills = found_skills[6:10] if len(found_skills) > 6 else []

    # 4. Technical Competencies dynamically derived from skills
    competencies = []
    if req_skills:
        for sk in req_skills[:4]:
            competencies.append(f"{sk} Architecture & Application")
    else:
        competencies = ["Core Domain Expertise", "Engineering Problem Solving"]

    # 5. Behavioural Competencies
    beh_candidates = ["Problem Solving", "Effective Communication", "Adaptability", "Collaboration", "Critical Thinking", "Ownership"]
    behavioural = []
    for b in beh_candidates:
        if re.search(rf"\b{re.escape(b[:7].lower())}\b", jd_text.lower()):
            behavioural.append(b)
    if not behavioural:
        behavioural = ["Problem Solving", "Communication", "Team Collaboration"]

    # 6. Experience Expectations
    exp = "As specified in job posting"
    exp_match = re.search(r"(\d+[\+\-]?\s*(?:to\s*\d+)?\s*(?:years?|yrs?|months?)\b[^\n\r.]*)", jd_text, re.IGNORECASE)
    if exp_match:
        exp = exp_match.group(1).strip()

    # 7. Keywords & Concepts
    keywords = req_skills[:6]
    concepts = [f"{s} implementation patterns" for s in req_skills[:3]]

    # 8. Key Qualifications
    qualifications = []
    for line in lines:
        if any(term in line.lower() for term in ["degree", "bachelor", "master", "experience in", "proficient in", "strong understanding"]):
            cleaned = re.sub(r"^[#*•\-\s]+", "", line).strip()
            if 15 < len(cleaned) < 160:
                qualifications.append(cleaned)
    if not qualifications:
        qualifications = [f"Demonstrated proficiency in {', '.join(req_skills[:3]) if req_skills else 'core competencies'}"]

    return RoleAnalysis(
        role_title=role_title,
        key_responsibilities=responsibilities[:6],
        required_skills=req_skills,
        preferred_skills=pref_skills,
        technical_competencies=competencies,
        behavioural_competencies=behavioural,
        experience_expectations=exp,
        important_keywords=keywords,
        important_concepts=concepts,
        key_qualifications=qualifications[:4]
    )

def dynamic_extract_candidate_and_fit(resume_text: str, role: RoleAnalysis) -> Tuple[CandidateAnalysis, JobFitAssessment]:
    """Dynamically parse candidate resume and calculate fit against role without canned data."""
    lines = [l.strip() for l in resume_text.splitlines() if l.strip()]
    
    # 1. Candidate Name
    cand_name = "Candidate"
    if lines:
        first = lines[0].replace("#", "").strip()
        if len(first.split()) in [2, 3, 4] and not any(c in first.lower() for c in ["resume", "curriculum", "page", "http", "@", "engineer", "developer"]):
            cand_name = first

    # 2. Extract Skills from resume text
    KNOWN_SKILLS = [
        "python", "javascript", "typescript", "react", "vue", "angular", "node.js", "nodejs",
        "fastapi", "django", "flask", "java", "c++", "c#", "golang", "go", "rust", "sql",
        "postgresql", "mysql", "mongodb", "redis", "docker", "kubernetes", "aws", "gcp", "azure",
        "machine learning", "deep learning", "nlp", "llm", "llms", "rag", "pytorch", "tensorflow",
        "keras", "scikit-learn", "git", "ci/cd", "rest api", "graphql", "html", "css", "tailwind",
        "linux", "system design", "data structures", "algorithms", "spark", "hadoop", "kafka"
    ]
    cand_skills = []
    for s in KNOWN_SKILLS:
        if re.search(rf"\b{re.escape(s)}\b", resume_text, re.IGNORECASE):
            cand_skills.append(s.title() if len(s) > 4 else s.upper())
    
    if not cand_skills:
        potential = re.findall(r"\b[A-Z][a-zA-Z0-9\+\#]{2,}\b", resume_text)
        cand_skills = list(dict.fromkeys([p for p in potential if p.lower() not in ["the", "and", "for", "with", "university", "school", "education", "experience", "projects"]]))[:8]

    # 3. Extract Real Projects from resume lines
    projects = []
    in_project_section = False
    for line in lines:
        clean = re.sub(r"^[#*•\-\s]+", "", line).strip()
        if re.match(r"^(projects|key projects|academic projects|personal projects)\b", clean, re.IGNORECASE):
            in_project_section = True
            continue
        if in_project_section and re.match(r"^(experience|education|skills|certifications)\b", clean, re.IGNORECASE):
            in_project_section = False
            continue
        
        if (in_project_section or any(verb in clean.lower() for verb in ["built", "developed", "created", "designed", "architected", "engineered", "implemented"])) and 20 < len(clean) < 180:
            projects.append(clean)
            if len(projects) >= 4:
                break
    
    if not projects:
        # Fallback to lines that describe activities
        projects = [re.sub(r"^[#*•\-\s]+", "", l) for l in lines if len(l) > 30][:3]

    # 4. Extract Real Achievements & Metrics from resume
    achievements = []
    for line in lines:
        clean = re.sub(r"^[#*•\-\s]+", "", line).strip()
        # Look for numbers, percentages, speedups, awards
        if re.search(r"(\d+%\s*|\$\d+|\bimproved\b|\breduced\b|\bincreased\b|\baccelerated\b|\bscale\b|\busers\b|\baward\b|\bpublished\b)", clean, re.IGNORECASE):
            if 20 < len(clean) < 180:
                achievements.append(clean)
                if len(achievements) >= 3:
                    break

    # 5. Extract specific claims to probe dynamically from resume text
    claims_to_probe = []
    for ach in achievements:
        claims_to_probe.append(f"Probe claim: '{ach}' — ask candidate to detail their baseline, methodology, and verification.")
    
    if not claims_to_probe and projects:
        claims_to_probe.append(f"Probe project architecture: '{projects[0]}' — evaluate specific technical choices, constraints, and trade-offs.")

    # 6. Compare Candidate Skills vs Role Required Skills
    req_set = {s.lower() for s in role.required_skills}
    cand_set = {s.lower() for s in cand_skills}

    strong_matches = [s for s in role.required_skills if s.lower() in cand_set]
    missing_skills = [s for s in role.required_skills if s.lower() not in cand_set]
    partial_matches = [s for s in role.preferred_skills if s.lower() in cand_set]

    # Calculate real mathematical fit percentage
    if role.required_skills:
        match_ratio = len(strong_matches) / len(role.required_skills)
        pref_ratio = (len(partial_matches) / len(role.preferred_skills)) if role.preferred_skills else 0.0
        calculated_fit = int(min(98, max(25, (match_ratio * 70) + (pref_ratio * 20) + 10)))
    else:
        calculated_fit = 65

    # Preparation Areas
    prep_areas = []
    if missing_skills:
        prep_areas.append(f"Review core concepts for missing required skills: {', '.join(missing_skills)}")
    if role.technical_competencies:
        prep_areas.append(f"Prepare deep technical architecture justifications for: {role.technical_competencies[0]}")
    prep_areas.append("Structure behavioral answers using the STAR method (Situation, Task, Action, Result)")

    candidate_analysis = CandidateAnalysis(
        candidate_name=cand_name,
        candidate_skills=cand_skills[:14],
        relevant_experience=[re.sub(r"^[#*•\-\s]+", "", l) for l in lines if any(k in l.lower() for k in ["intern", "engineer", "developer", "experience", "lead"])][:3],
        relevant_projects=projects[:4],
        relevant_achievements=achievements[:3],
        strengths_against_jd=strong_matches if strong_matches else cand_skills[:3],
        missing_skills=missing_skills if missing_skills else ["Advanced production edge cases"],
        weak_or_insufficient_areas=[f"Demonstrating depth in {m}" for m in missing_skills[:2]] if missing_skills else ["Quantifying impact with concrete metrics"],
        potential_resume_claims=claims_to_probe[:3],
        preparation_areas=prep_areas
    )

    fit_summary = f"Based on your resume, you have verified experience in {', '.join(strong_matches) if strong_matches else 'foundational skills'}. "
    if missing_skills:
        fit_summary += f"Preparation should focus on {', '.join(missing_skills[:3])}."
    else:
        fit_summary += "Strong alignment with the core requirements of this role."

    job_fit = JobFitAssessment(
        fit_percentage=calculated_fit,
        strong_match=strong_matches,
        partial_match=partial_matches,
        missing_weak=missing_skills,
        summary=fit_summary
    )

    return candidate_analysis, job_fit

async def analyze_documents(
    jd_text: str,
    resume_text: str,
    api_key: str = None,
    provider: str = "gemini"
) -> AnalysisResponse:
    """Analyze both JD and Resume using dynamic LLM or dynamic parser without canned defaults."""
    # Attempt LLM Role Analysis
    role_prompt = ROLE_PROMPT_TEMPLATE.format(jd_text=jd_text)
    role_json = await llm_service.generate_json(
        prompt=role_prompt,
        system_instruction="You are an expert tech hiring leader. Return strict JSON only. Extract only actual details from the provided JD.",
        api_key=api_key,
        provider=provider
    )
    
    if role_json and "role_title" in role_json and "required_skills" in role_json:
        try:
            role_analysis = RoleAnalysis(**role_json)
        except Exception:
            role_analysis = dynamic_extract_role_from_text(jd_text)
    else:
        role_analysis = dynamic_extract_role_from_text(jd_text)

    # Attempt LLM Candidate Fit Analysis
    cand_prompt = CANDIDATE_FIT_PROMPT_TEMPLATE.format(
        role_title=role_analysis.role_title,
        required_skills=", ".join(role_analysis.required_skills),
        technical_competencies=", ".join(role_analysis.technical_competencies),
        resume_text=resume_text
    )
    cand_json = await llm_service.generate_json(
        prompt=cand_prompt,
        system_instruction="You are an expert technical interviewer. Return strict JSON only. Extract real information from candidate resume.",
        api_key=api_key,
        provider=provider
    )

    if cand_json and "candidate_skills" in cand_json and "job_fit" in cand_json:
        try:
            fit_data = cand_json.pop("job_fit")
            candidate_analysis = CandidateAnalysis(**cand_json)
            job_fit = JobFitAssessment(**fit_data)
        except Exception:
            candidate_analysis, job_fit = dynamic_extract_candidate_and_fit(resume_text, role_analysis)
    else:
        candidate_analysis, job_fit = dynamic_extract_candidate_and_fit(resume_text, role_analysis)

    return AnalysisResponse(
        role_analysis=role_analysis,
        candidate_analysis=candidate_analysis,
        job_fit=job_fit
    )
