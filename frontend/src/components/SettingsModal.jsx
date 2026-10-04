import React, { useState } from "react";
import { X, Sliders, Check, Volume2, UserCheck } from "lucide-react";

export default function SettingsModal({
  isOpen,
  onClose,
  persona,
  setPersona
}) {
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("interview_accelerator_persona", persona);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
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
        maxWidth: "480px",
        padding: "30px",
        background: "rgba(18, 24, 38, 0.95)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        border: "1px solid var(--border-highlight)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sliders size={20} color="#818cf8" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Interview Preferences</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
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
            style={{ height: "44px", padding: "8px 12px", background: "rgba(10, 14, 23, 0.9)" }}
          >
            <option value="Professional & Rigorous">Professional & Rigorous (Standard Senior Technical Lead)</option>
            <option value="Supportive Coach">Supportive Coach (Encouraging, guiding on fundamentals)</option>
            <option value="Strict Tech Lead">Strict Tech Lead (Challenging, rapid counter-questions, deep trade-offs)</option>
          </select>
          <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "6px" }}>
            Controls the AI interviewer's questioning tone, challenge depth, and behavioral evaluation strictness.
          </p>
        </div>

        {/* Server Security Notice */}
        <div style={{
          background: "rgba(99, 102, 241, 0.08)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: "var(--radius-md)",
          padding: "12px 14px",
          marginBottom: "24px",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          lineHeight: 1.45
        }}>
          🔒 <strong>Secure Server-Side AI:</strong> AI processing is managed securely on the backend server. No credentials or keys are exposed to the browser.
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
              "Save Preferences"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
