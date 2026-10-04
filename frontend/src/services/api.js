function getApiBase() {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:8000/api";
    }
    // Automatically detect Render backend when deployed on onrender.com
    if (host.includes("onrender.com")) {
      const backendHost = host.replace("-frontend", "-backend");
      return `https://${backendHost}/api`;
    }
  }
  return "/api";
}

const API_BASE = getApiBase();

export function getUserId() {
  let uid = localStorage.getItem("interview_accelerator_user_id");
  if (!uid) {
    uid = "usr_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem("interview_accelerator_user_id", uid);
  }
  return uid;
}

export function getApiKey() {
  return localStorage.getItem("interview_accelerator_gemini_key") || "";
}

export function setApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem("interview_accelerator_gemini_key", key.trim());
  } else {
    localStorage.removeItem("interview_accelerator_gemini_key");
  }
}

function getAuthHeaders(extra = {}) {
  const headers = {
    "X-User-Id": getUserId(),
    ...extra,
  };
  const key = getApiKey();
  if (key) {
    headers["X-Api-Key"] = key;
  }
  return headers;
}

export async function testApiKey(key) {
  const activeKey = key !== undefined ? key.trim() : getApiKey();
  const response = await fetch(`${API_BASE}/test-key`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ api_key: activeKey }),
  });
  if (!response.ok) {
    return { valid: false, message: "Could not connect to backend server." };
  }
  return await response.json();
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "offline", gemini_configured: false, openai_configured: false };
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_BASE}/extract-text`, {
    method: "POST",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      job_description: jobDescription,
      resume: resume,
      provider: provider || "gemini",
      api_key: getApiKey() || undefined
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
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      role_analysis: roleAnalysis,
      candidate_analysis: candidateAnalysis,
      job_fit: jobFit,
      interviewer_persona: persona,
      provider: provider || "gemini",
      user_id: getUserId(),
      api_key: getApiKey() || undefined
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
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      session_id: sessionId,
      answer_text: answerText,
      wpm: wpm,
      duration_seconds: durationSeconds,
      filler_words: fillerWords,
      provider: provider || "gemini",
      api_key: getApiKey() || undefined
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
    method: "POST",
    headers: getAuthHeaders()
  });
  return await response.json();
}

export async function fetchPerformanceReport(sessionId, provider = "gemini") {
  let url = `${API_BASE}/interview/report/${sessionId}`;
  if (provider) {
    url += `?provider=${encodeURIComponent(provider)}`;
  }

  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
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


