import React from "react";
import { Sparkles, Settings, History, RotateCcw, ShieldCheck, Users, Sun, Moon } from "lucide-react";

export default function Navbar({
  currentStep,
  setStep,
  onOpenSettings,
  onOpenHistory,
  onOpenRecruiter,
  onReset,
  isAiActive,
  theme = "light",
  toggleTheme
}) {
  const steps = [
    { id: "input", label: "1. Inputs", shortLabel: "1. Inputs" },
    { id: "role", label: "2. Role Analysis", shortLabel: "2. Role" },
    { id: "fit", label: "3. Candidate Fit", shortLabel: "3. Fit" },
    { id: "interview", label: "4. AI Interview", shortLabel: "4. Interview" },
    { id: "report", label: "5. Performance Report", shortLabel: "5. Report" },
  ];

  return (
    <header className="no-print" style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--navbar-bg)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: "12px 24px",
      transition: "background-color 0.25s ease, border-color 0.25s ease"
    }}>
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "nowrap"
      }}>
        {/* Brand: Custom Apex Prism Aperture Emblem */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", flexShrink: 0 }}
          onClick={() => setStep("input")}
        >
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "11px",
            background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px var(--primary-glow)",
            flexShrink: 0
          }}>
            {/* Custom Modern Geometric Logo (Apex Aperture Prism) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M12 6.5L17.5 12L12 17.5L6.5 12L12 6.5Z"
                fill="#ffffff"
                fillOpacity="0.32"
                stroke="#ffffff"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-heading)", letterSpacing: "-0.01em", color: "var(--text-main)" }}>
                Interview<span style={{ color: "var(--primary)" }}>Accelerator</span>
              </span>
              <span className="badge badge-primary tablet-hide" style={{ fontSize: "0.68rem", padding: "2px 8px" }}>
                AI Voice & Video
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={12} color="#059669" /> Powered by Student Credibility
            </div>
          </div>
        </div>

        {/* Step Progress Pill Nav */}
        <nav
          aria-label="Workflow progress"
          className="tablet-hide"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: "var(--card-inner)",
            padding: "4px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-subtle)"
          }}
        >
          {steps.map((s) => {
            const isActive = currentStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                style={{
                  background: isActive ? "var(--bg-card)" : "transparent",
                  border: isActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                  color: isActive ? "var(--primary)" : "var(--text-dim)",
                  padding: "6px 13px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
              >
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
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
              background: isAiActive ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
              borderColor: isAiActive ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.35)",
              color: isAiActive ? "var(--emerald)" : "var(--amber)"
            }}
          >
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: isAiActive ? "#10b981" : "#f59e0b",
              boxShadow: isAiActive ? "0 0 6px #10b981" : "0 0 6px #f59e0b"
            }} />
            <span className="desktop-only">{isAiActive ? "Free AI Active" : "Connect AI Key"}</span>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            className="btn btn-secondary"
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            style={{ padding: "7px 11px", fontSize: "0.82rem" }}
          >
            {theme === "light" ? <Moon size={15} color="var(--text-muted)" /> : <Sun size={15} color="#fbbf24" />}
            <span className="desktop-only">{theme === "light" ? "Dark" : "Light"}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onOpenHistory}
            title="Interview History"
            style={{ padding: "7px 11px", fontSize: "0.82rem" }}
          >
            <History size={15} />
            <span className="desktop-only">History</span>
          </button>

          {onOpenRecruiter && (
            <button
              className="btn btn-secondary"
              onClick={onOpenRecruiter}
              title="Recruiter & Pipeline Dashboard"
              style={{
                padding: "7px 11px",
                fontSize: "0.82rem",
                color: "var(--primary)",
                borderColor: "var(--border-highlight)"
              }}
            >
              <Users size={15} />
              <span className="desktop-only">Recruiter</span>
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={onOpenSettings}
            title="LLM & Persona Settings"
            style={{ padding: "7px 11px", fontSize: "0.82rem" }}
          >
            <Settings size={15} />
            <span className="desktop-only">Settings</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onReset}
            title="Start Over with New Inputs"
            style={{ padding: "7px 10px", fontSize: "0.82rem", color: "var(--text-dim)" }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
