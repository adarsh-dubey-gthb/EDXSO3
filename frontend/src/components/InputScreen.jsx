import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Sparkles, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from "lucide-react";
import { uploadDocument } from "../services/api";

export default function InputScreen({
  jdText,
  setJdText,
  resumeText,
  setResumeText,
  onAnalyze,
  isLoading,
  sampleData,
  onLoadSample,
  isAiActive,
  onOpenSettings
}) {
  const [jdFileName, setJdFileName] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jdUploading, setJdUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const jdFileInputRef = useRef(null);
  const resumeFileInputRef = useRef(null);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    if (type === "jd") {
      setJdUploading(true);
      setJdFileName(file.name);
      try {
        const res = await uploadDocument(file);
        setJdText(res.text);
      } catch (err) {
        setUploadError(`Failed to parse JD file: ${err.message}`);
      } finally {
        setJdUploading(false);
      }
    } else {
      setResumeUploading(true);
      setResumeFileName(file.name);
      try {
        const res = await uploadDocument(file);
        setResumeText(res.text);
      } catch (err) {
        setUploadError(`Failed to parse Resume file: ${err.message}`);
      } finally {
        setResumeUploading(false);
      }
    }
  };

  const jdWordCount = jdText.trim() ? jdText.trim().split(/\s+/).length : 0;
  const resumeWordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;
  const canProceed = jdText.trim().length > 20 && resumeText.trim().length > 20;

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Hero Header */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 16px",
          background: "var(--card-inner)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-full)",
          marginBottom: "16px"
        }}>
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>
            AI-Powered Technical & Behavioral Interview Accelerator
          </span>
        </div>
        
        <h1 style={{ fontSize: "2.4rem", marginBottom: "12px", lineHeight: 1.25 }}>
          Step Into Your Real Interview <span style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>100% Prepared</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "720px", margin: "0 auto", lineHeight: 1.6 }}>
          Upload or paste any Job Description and Candidate Resume. The system automatically uncovers employer requirements, calculates your Job Fit, and launches a dynamic 3-level voice & video mock interview.
        </p>

        {/* AI Status Banner */}
        {isAiActive ? (
          <div style={{
            margin: "18px auto 0",
            maxWidth: "760px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            fontSize: "0.82rem",
            color: "var(--emerald)",
            lineHeight: 1.45
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", flexShrink: 0 }} />
              <span>
                <strong>Free AI Tier Enabled:</strong> Real-time Gemini evaluation is active. If the shared free tier exhausts, simply connect your own Gemini API key in Settings.
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: "0.75rem", whiteSpace: "nowrap", borderColor: "rgba(16, 185, 129, 0.35)", color: "var(--emerald)" }}
            >
              Settings
            </button>
          </div>
        ) : (
          <div style={{
            margin: "20px auto 0",
            maxWidth: "680px",
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            fontSize: "0.82rem",
            color: "var(--amber)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={16} />
              <span>
                <strong>Heuristic Fallback:</strong> For 100% dynamic AI generation personalized to this resume, connect your Gemini API key.
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary"
              style={{ padding: "4px 12px", fontSize: "0.76rem", whiteSpace: "nowrap", borderColor: "rgba(245, 158, 11, 0.4)", color: "var(--amber)" }}
            >
              Connect Key
            </button>
          </div>
        )}

        {/* Preset Selector */}
        {sampleData && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quick Presets:
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => onLoadSample("ai_intern")}
              style={{ fontSize: "0.82rem", padding: "6px 14px" }}
            >
              <BookOpen size={14} color="#818cf8" />
              AI Engineer Intern (Assignment Spec)
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onLoadSample("fullstack_engineer")}
              style={{ fontSize: "0.82rem", padding: "6px 14px" }}
            >
              <BookOpen size={14} color="#34d399" />
              Full Stack Engineer Intern
            </button>
            {(jdText || resumeText) && (
              <button
                className="btn btn-secondary"
                onClick={() => { setJdText(""); setResumeText(""); setJdFileName(""); setResumeFileName(""); }}
                style={{ fontSize: "0.82rem", padding: "6px 14px", color: "var(--text-dim)" }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {uploadError && (
        <div style={{
          background: "rgba(244, 63, 94, 0.12)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          color: "#fda4af",
          padding: "12px 18px",
          borderRadius: "var(--radius-md)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <AlertCircle size={18} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Dual Document Input Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* Job Description Card */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(79, 70, 229, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={18} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>1. Job Description</h2>
            </div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
              {jdWordCount} words
            </span>
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "14px" }}>
            Paste the target role description, requirements, and responsibilities, or upload a document (.pdf, .docx, .txt).
          </p>

          {/* Upload trigger */}
          <input
            type="file"
            ref={jdFileInputRef}
            onChange={(e) => handleFileUpload(e, "jd")}
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: "none" }}
          />
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => jdFileInputRef.current?.click()}
              disabled={jdUploading}
              style={{ fontSize: "0.84rem", padding: "7px 14px" }}
            >
              <UploadCloud size={15} />
              {jdUploading ? "Extracting..." : jdFileName ? `Change: ${jdFileName}` : "Upload JD File (PDF/DOCX)"}
            </button>
            {jdFileName && !jdUploading && (
              <span style={{ fontSize: "0.78rem", color: "#34d399", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> File Loaded
              </span>
            )}
          </div>

          <textarea
            className="textarea-custom"
            rows={14}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste complete Job Description here... (e.g. Role, Responsibilities, Required Tech Stack, Qualifications)"
            style={{ flex: 1 }}
          />
        </div>

        {/* Candidate Resume Card */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(5, 150, 105, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={18} color="var(--emerald)" />
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>2. Candidate Resume</h2>
            </div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
              {resumeWordCount} words
            </span>
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "14px" }}>
            Paste candidate CV/Resume text (education, projects, metrics, tech stack), or upload a file (.pdf, .docx, .txt).
          </p>

          {/* Upload trigger */}
          <input
            type="file"
            ref={resumeFileInputRef}
            onChange={(e) => handleFileUpload(e, "resume")}
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: "none" }}
          />
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => resumeFileInputRef.current?.click()}
              disabled={resumeUploading}
              style={{ fontSize: "0.84rem", padding: "7px 14px" }}
            >
              <UploadCloud size={15} />
              {resumeUploading ? "Extracting..." : resumeFileName ? `Change: ${resumeFileName}` : "Upload Resume File (PDF/DOCX)"}
            </button>
            {resumeFileName && !resumeUploading && (
              <span style={{ fontSize: "0.78rem", color: "#34d399", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> File Loaded
              </span>
            )}
          </div>

          <textarea
            className="textarea-custom"
            rows={14}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste Candidate Resume text here... (Projects, claimed metrics like 'improved accuracy 18%', technologies, experience)"
            style={{ flex: 1 }}
          />
        </div>

      </div>

      {/* Main Action Bar */}
      <div style={{ textAlign: "center" }}>
        <button
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={!canProceed || isLoading}
          style={{
            padding: "16px 40px",
            fontSize: "1.1rem",
            borderRadius: "var(--radius-full)",
            boxShadow: canProceed ? "0 8px 30px rgba(99, 102, 241, 0.45)" : "none"
          }}
        >
          {isLoading ? (
            <>
              <div className="waveform-container" style={{ height: "20px" }}>
                <span className="waveform-bar" style={{ background: "#ffffff" }}></span>
                <span className="waveform-bar" style={{ background: "#ffffff" }}></span>
                <span className="waveform-bar" style={{ background: "#ffffff" }}></span>
              </div>
              <span>Analyzing Role & Candidate Fit...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Analyze Role & Calculate Job Fit</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
        {!canProceed && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginTop: "10px" }}>
            * Please enter or upload both a Job Description and a Resume to proceed.
          </p>
        )}
      </div>

    </div>
  );
}
