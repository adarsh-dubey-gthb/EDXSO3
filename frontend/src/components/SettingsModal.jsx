import React, { useState, useEffect } from "react";
import { X, Sliders, Check, UserCheck, Key, Sparkles, CheckCircle2, AlertCircle, ExternalLink, Trash2 } from "lucide-react";
import { getApiKey, setApiKey as saveApiKey, testApiKey } from "../services/api";

export default function SettingsModal({
  isOpen,
  onClose,
  persona,
  setPersona,
  onSettingsSaved
}) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getApiKey());
      setTestResult(null);
      setSavedNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testApiKey(apiKeyInput);
      setTestResult(res);
    } catch (e) {
      setTestResult({ valid: false, message: "Could not test connection: " + e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem("interview_accelerator_persona", persona);
    saveApiKey(apiKeyInput);
    setSavedNotice(true);
    if (onSettingsSaved) {
      onSettingsSaved(apiKeyInput);
    }
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  const handleClearKey = () => {
    setApiKeyInput("");
    saveApiKey("");
    setTestResult(null);
    if (onSettingsSaved) {
      onSettingsSaved("");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: "540px",
        padding: "30px",
        background: "rgba(18, 24, 38, 0.95)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        border: "1px solid var(--border-highlight)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sliders size={20} color="#818cf8" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>AI & Interview Settings</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Tier Info Card */}
        <div style={{
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "var(--radius-md)",
          padding: "12px 14px",
          marginBottom: "18px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          fontSize: "0.82rem",
          color: "#34d399",
          lineHeight: 1.5
        }}>
          <Sparkles size={18} style={{ flexShrink: 0, marginTop: "2px", color: "#10b981" }} />
          <div>
            <strong>Free AI Tier Already Enabled:</strong> The system is pre-configured with a complimentary AI tier for all users. If high usage exhausts the free tier quota, simply paste your own free Gemini API key below to continue uninterrupted.
          </div>
        </div>

        {/* Gemini API Key Input */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <label style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Key size={14} color="#818cf8" />
              Google Gemini API Key
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "0.75rem", color: "#818cf8", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}
            >
              Get Free Key <ExternalLink size={11} />
            </a>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste your Gemini API key (e.g. AIzaSy...)"
              className="textarea-custom"
              style={{ height: "42px", padding: "8px 12px", background: "rgba(10, 14, 23, 0.9)", flex: 1, fontFamily: "monospace", fontSize: "0.85rem" }}
            />
            {apiKeyInput && (
              <button
                type="button"
                onClick={handleClearKey}
                title="Clear Key"
                className="btn btn-secondary"
                style={{ padding: "0 10px", color: "#f87171" }}
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testing || !apiKeyInput.trim()}
              className="btn btn-secondary"
              style={{ padding: "0 14px", fontSize: "0.8rem", whiteSpace: "nowrap" }}
            >
              {testing ? "Testing..." : "Test Key"}
            </button>
          </div>
          <p style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: "6px", lineHeight: 1.4 }}>
            Enables 100% dynamic AI generation for role breakdown, candidate scoring, adaptive counter-questioning, and comprehensive reports. Saved locally in your browser.
          </p>

          {/* Test Result Message */}
          {testResult && (
            <div style={{
              marginTop: "10px",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: testResult.valid ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)",
              border: `1px solid ${testResult.valid ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
              color: testResult.valid ? "#34d399" : "#fb7185"
            }}>
              {testResult.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Persona Select */}
        <div style={{ marginBottom: "22px" }}>
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>
            <UserCheck size={14} style={{ display: "inline", marginRight: "6px" }} />
            Interviewer Persona & Style
          </label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="textarea-custom"
            style={{ height: "42px", padding: "8px 12px", background: "rgba(10, 14, 23, 0.9)" }}
          >
            <option value="Professional & Rigorous">Professional & Rigorous (Standard Senior Technical Lead)</option>
            <option value="Supportive Coach">Supportive Coach (Encouraging, guiding on fundamentals)</option>
            <option value="Strict Tech Lead">Strict Tech Lead (Challenging, rapid counter-questions, deep trade-offs)</option>
          </select>
          <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "6px" }}>
            Controls the AI interviewer's questioning tone, challenge depth, and behavioral evaluation strictness.
          </p>
        </div>

        {/* Privacy Note */}
        <div style={{
          background: "rgba(99, 102, 241, 0.06)",
          border: "1px solid rgba(99, 102, 241, 0.18)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          marginBottom: "24px",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          lineHeight: 1.45
        }}>
          🔒 <strong>Privacy & Security:</strong> Your credentials and interview transcripts remain private and are used solely to conduct your mock session.
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {savedNotice ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
