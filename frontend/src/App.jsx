import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import InputScreen from "./components/InputScreen";
import RoleAnalysisScreen from "./components/RoleAnalysisScreen";
import CandidateFitScreen from "./components/CandidateFitScreen";
import InterviewRoomScreen from "./components/InterviewRoomScreen";
import PerformanceReportScreen from "./components/PerformanceReportScreen";
import SettingsModal from "./components/SettingsModal";
import HistoryModal from "./components/HistoryModal";
import RecruiterModal from "./components/RecruiterModal";
import {
  fetchSampleData,
  analyzeRoleAndResume,
  startInterviewSession,
  fetchPerformanceReport,
  fetchInterviewHistory,
  fetchSavedInterviewSession,
  deleteInterviewHistoryItem,
  clearAllInterviewHistory,
  getApiKey,
  fetchHealth
} from "./services/api";

export default function App() {
  const [currentStep, setStep] = useState("input");
  const [isAiActive, setIsAiActive] = useState(false);
  
  // Document inputs
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [sampleData, setSampleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Analysis results
  const [roleData, setRoleData] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const [jobFit, setJobFit] = useState(null);

  // Interview state
  const [sessionInfo, setSessionInfo] = useState(null);

  // Evaluation Report state
  const [report, setReport] = useState(null);

  // Settings & Configuration
  const [provider, setProvider] = useState("gemini");
  const [persona, setPersona] = useState("Professional & Rigorous");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRecruiterOpen, setIsRecruiterOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const reloadHistory = async () => {
    try {
      const dbList = await fetchInterviewHistory();
      if (dbList && dbList.length > 0) {
        setHistoryList(dbList);
        return;
      }
    } catch (e) {
      console.warn("Could not load database history:", e);
    }
    const stored = localStorage.getItem("interview_accelerator_history");
    if (stored) {
      try { setHistoryList(JSON.parse(stored)); } catch (e) {}
    }
  };

  const checkAiStatus = async () => {
    const localKey = getApiKey();
    if (localKey && localKey.trim().length > 5) {
      setIsAiActive(true);
      return;
    }
    const health = await fetchHealth();
    setIsAiActive(Boolean(health.gemini_configured || health.openai_configured));
  };

  // Load sample presets and persistent settings on mount
  useEffect(() => {
    // Load sample templates from backend
    fetchSampleData()
      .then(data => {
        setSampleData(data);
      })
      .catch(err => console.warn("Failed to fetch presets:", err));

    // Load stored configs
    const storedPersona = localStorage.getItem("interview_accelerator_persona") || "Professional & Rigorous";
    if (storedPersona) setPersona(storedPersona);

    reloadHistory();
    checkAiStatus();
  }, []);

  const handleLoadSample = (key) => {
    if (sampleData && sampleData[key]) {
      setJdText(sampleData[key].jd);
      setResumeText(sampleData[key].resume);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const res = await analyzeRoleAndResume(jdText, resumeText, provider);
      setRoleData(res.role_analysis);
      setCandidateData(res.candidate_analysis);
      setJobFit(res.job_fit);
      setStep("role");
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInterview = async () => {
    setIsLoading(true);
    try {
      const session = await startInterviewSession(
        roleData,
        candidateData,
        jobFit,
        persona,
        provider
      );
      setSessionInfo(session);
      setStep("interview");
    } catch (err) {
      alert(`Could not start interview session: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishInterview = async (sessionId) => {
    setIsLoading(true);
    setStep("report");
    try {
      const rep = await fetchPerformanceReport(sessionId, provider);
      setReport(rep);
      // Refresh history list from database
      await reloadHistory();
    } catch (err) {
      alert(`Could not load report: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadReport = async (item) => {
    setIsLoading(true);
    try {
      if (item.session_id) {
        // Fetch full report and role from database
        const detail = await fetchSavedInterviewSession(item.session_id);
        if (detail && detail.report) {
          setReport(detail.report);
          if (detail.role_analysis) setRoleData(detail.role_analysis);
          if (detail.candidate_analysis) setCandidateData(detail.candidate_analysis);
          setStep("report");
          return;
        }
      }
      setReport(item);
      setStep("report");
    } catch (e) {
      if (item.overall_score) {
        setReport(item);
        setStep("report");
      } else {
        alert("Failed to load interview report: " + e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (sessionId) => {
    try {
      await deleteInterviewHistoryItem(sessionId);
    } catch (e) {
      console.warn("Database delete note:", e);
    }
    const updated = historyList.filter(h => h.session_id !== sessionId);
    setHistoryList(updated);
    localStorage.setItem("interview_accelerator_history", JSON.stringify(updated));
  };

  const handleSaveHistory = () => {
    if (!report) return;
    const historyItem = {
      ...report,
      role_title: roleData?.role_title || "Technical Interview",
      saved_at: new Date().toISOString()
    };
    const updated = [historyItem, ...historyList.filter(h => h.session_id !== report.session_id)];
    setHistoryList(updated);
    localStorage.setItem("interview_accelerator_history", JSON.stringify(updated));
    alert("Saved this interview report to your history!");
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all interview history?")) return;
    try {
      await clearAllInterviewHistory();
    } catch (e) {
      console.warn("Database clear note:", e);
    }
    setHistoryList([]);
    localStorage.removeItem("interview_accelerator_history");
  };

  const handleReset = () => {
    if (window.confirm("Start over with new documents?")) {
      setRoleData(null);
      setCandidateData(null);
      setJobFit(null);
      setSessionInfo(null);
      setReport(null);
      setStep("input");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        currentStep={currentStep}
        setStep={setStep}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenRecruiter={() => setIsRecruiterOpen(true)}
        onReset={handleReset}
        isAiActive={isAiActive}
      />

      <main style={{ flex: 1 }}>
        {currentStep === "input" && (
          <InputScreen
            jdText={jdText}
            setJdText={setJdText}
            resumeText={resumeText}
            setResumeText={setResumeText}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            sampleData={sampleData}
            onLoadSample={handleLoadSample}
            isAiActive={isAiActive}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentStep === "role" && (
          <RoleAnalysisScreen
            roleData={roleData}
            onNext={() => setStep("fit")}
            onBack={() => setStep("input")}
          />
        )}

        {currentStep === "fit" && (
          <CandidateFitScreen
            candidateData={candidateData}
            jobFit={jobFit}
            roleData={roleData}
            onStartInterview={handleStartInterview}
            onBack={() => setStep("role")}
          />
        )}

        {currentStep === "interview" && (
          <InterviewRoomScreen
            sessionInfo={sessionInfo}
            roleData={roleData}
            candidateData={candidateData}
            onFinishInterview={handleFinishInterview}
            provider={provider}
            persona={persona}
          />
        )}

        {currentStep === "report" && (
          <PerformanceReportScreen
            report={report}
            roleData={roleData}
            candidateData={candidateData}
            onRestart={handleReset}
            onSaveHistory={handleSaveHistory}
            onLaunchFollowUp={handleStartInterview}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print" style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "20px",
        textAlign: "center",
        fontSize: "0.82rem",
        color: "var(--text-dim)",
        marginTop: "40px"
      }}>
        <div>
          AI Product Engineer Challenge — Assignment 3 • <strong style={{ color: "#818cf8" }}>Interview Accelerator</strong>
        </div>
        <div style={{ marginTop: "4px" }}>
          Built for Student Credibility • FastAPI Backend + React Vite Architecture
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        persona={persona}
        setPersona={setPersona}
        onSettingsSaved={checkAiStatus}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onLoadReport={handleLoadReport}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
      />

      <RecruiterModal
        isOpen={isRecruiterOpen}
        onClose={() => setIsRecruiterOpen(false)}
        historyList={historyList}
        onLoadReport={handleLoadReport}
      />
    </div>
  );
}
