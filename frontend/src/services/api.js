const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000/api"
    : "/api"
);

export function getUserId() {
  let uid = localStorage.getItem("interview_accelerator_user_id");
  if (!uid) {
    uid = "usr_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem("interview_accelerator_user_id", uid);
  }
  return uid;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_BASE}/extract-text`, {
    method: "POST",
    headers: { "X-User-Id": getUserId() },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(errorData.detail || "File extraction failed");
  }
  
  return await response.json();
}

export async function fetchSampleData() {
  const response = await fetch(`${API_BASE}/sample-data`);
  if (!response.ok) {
    throw new Error("Failed to load sample templates");
  }
  return await response.json();
}

export async function analyzeRoleAndResume(jobDescription, resume, provider = "gemini") {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": getUserId()
    },
    body: JSON.stringify({
      job_description: jobDescription,
      resume: resume,
      provider: provider || "gemini"
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(errorData.detail || "Failed to analyze documents");
  }
  
  return await response.json();
}

export async function startInterviewSession(roleAnalysis, candidateAnalysis, jobFit, persona = "Professional & Rigorous", provider = "gemini") {
  const response = await fetch(`${API_BASE}/interview/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": getUserId()
    },
    body: JSON.stringify({
      role_analysis: roleAnalysis,
      candidate_analysis: candidateAnalysis,
      job_fit: jobFit,
      interviewer_persona: persona,
      provider: provider || "gemini",
      user_id: getUserId()
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Failed to initialize interview" }));
    throw new Error(err.detail || "Interview initialization failed");
  }

  return await response.json();
}

export async function submitInterviewAnswer(sessionId, answerText, wpm = 0, durationSeconds = 0, fillerWords = {}, provider = "gemini") {
  const response = await fetch(`${API_BASE}/interview/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      answer_text: answerText,
      wpm: wpm,
      duration_seconds: durationSeconds,
      filler_words: fillerWords,
      provider: provider || "gemini"
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Failed to submit answer" }));
    throw new Error(err.detail || "Failed to submit interview response");
  }

  return await response.json();
}

export async function finishInterviewSession(sessionId) {
  const response = await fetch(`${API_BASE}/interview/finish/${sessionId}`, {
    method: "POST"
  });
  return await response.json();
}

export async function fetchPerformanceReport(sessionId, provider = "gemini") {
  let url = `${API_BASE}/interview/report/${sessionId}`;
  if (provider) {
    url += `?provider=${encodeURIComponent(provider)}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Failed to generate report" }));
    throw new Error(err.detail || "Report generation failed");
  }

  return await response.json();
}

export async function transcribeAudioFile(audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "answer_audio.webm");

  const response = await fetch(`${API_BASE}/transcribe-audio`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Audio transcription failed" }));
    throw new Error(err.detail || "Server audio transcription failed");
  }

  return await response.json();
}

export async function fetchInterviewHistory(limit = 50) {
  const response = await fetch(`${API_BASE}/history?limit=${limit}`, {
    headers: { "X-User-Id": getUserId() }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch interview history from database");
  }
  const data = await response.json();
  return data.history || [];
}

export async function fetchSavedInterviewSession(sessionId) {
  const response = await fetch(`${API_BASE}/history/${sessionId}`, {
    headers: { "X-User-Id": getUserId() }
  });
  if (!response.ok) {
    throw new Error("Failed to retrieve saved session from database");
  }
  return await response.json();
}

export async function deleteInterviewHistoryItem(sessionId) {
  const response = await fetch(`${API_BASE}/history/${sessionId}`, {
    method: "DELETE",
    headers: { "X-User-Id": getUserId() }
  });
  if (!response.ok) {
    throw new Error("Failed to delete interview record");
  }
  return await response.json();
}

export async function clearAllInterviewHistory() {
  const response = await fetch(`${API_BASE}/history`, {
    method: "DELETE",
    headers: { "X-User-Id": getUserId() }
  });
  if (!response.ok) {
    throw new Error("Failed to clear interview history");
  }
  return await response.json();
}


