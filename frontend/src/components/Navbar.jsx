import React from "react";
import { Sparkles, Settings, History, RotateCcw, Brain, ShieldCheck } from "lucide-react";

export default function Navbar({ currentStep, setStep, onOpenSettings, onOpenHistory, onReset, isAiActive }) {
  const steps = [
    { id: "input", label: "1. Inputs" },
    { id: "role", label: "2. Role Analysis" },
    { id: "fit", label: "3. Candidate Fit" },
    { id: "interview", label: "4. AI Interview" },
    { id: "report", label: "5. Performance Report" },
  ];

  return (
    <header className="no-print" style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(15, 21, 35, 0.88)",
      backdropFilter: "blur(16px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: "14px 28px"
    }}>
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px"
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setStep("input")}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)"
          }}>
            <Brain size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-heading)", letterSpacing: "-0.01em" }}>
                Interview<span style={{ color: "#818cf8" }}>Accelerator</span>
              </span>
              <span className="badge badge-primary" style={{ fontSize: "0.68rem", padding: "2px 8px" }}>
                AI Voice & Video
              </span>
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={12} color="#10b981" /> Powered by Student Credibility
            </div>
          </div>
        </div>

        {/* Step Progress Pill Nav */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "rgba(255, 255, 255, 0.04)",
          padding: "4px",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-subtle)"
        }}>
          {steps.map((s) => {
            const isActive = currentStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                style={{
                  background: isActive ? "rgba(99, 102, 241, 0.25)" : "transparent",
                  border: isActive ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
                  color: isActive ? "#ffffff" : "var(--text-dim)",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* AI Engine Status Badge */}
          <button
            onClick={onOpenSettings}
            className="btn btn-secondary"
            title={isAiActive ? "Free AI Tier Active — If exhausted, connect your personal key in Settings" : "AI key required for live Gemini generation — click to configure"}
            style={{
              padding: "6px 12px",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: isAiActive ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.14)",
              borderColor: isAiActive ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.35)",
              color: isAiActive ? "#34d399" : "#fbbf24"
            }}
          >
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: isAiActive ? "#10b981" : "#f59e0b",
              boxShadow: isAiActive ? "0 0 8px #10b981" : "0 0 8px #f59e0b"
            }} />
            <span className="desktop-only">{isAiActive ? "Free AI Tier Active" : "Connect AI Key"}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onOpenHistory}
            title="Interview History"
            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
          >
            <History size={16} />
            <span className="desktop-only">History</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onOpenSettings}
            title="LLM & Persona Settings"
            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
          >
            <Settings size={16} />
            <span className="desktop-only">Settings</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onReset}
            title="Start Over"
            style={{ padding: "8px 12px", fontSize: "0.85rem", color: "var(--text-dim)" }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
