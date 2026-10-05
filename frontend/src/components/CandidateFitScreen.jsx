import React from "react";
import { User, CheckCircle, AlertTriangle, XCircle, ArrowRight, ArrowLeft, ShieldAlert, Award, FileCode, Play } from "lucide-react";
import { voiceManager } from "../services/speech";

export default function CandidateFitScreen({ candidateData, jobFit, roleData, onStartInterview, onBack }) {
  if (!candidateData || !jobFit) return null;

  const fitPercent = jobFit.fit_percentage || 78;
  const strokeDash = 2 * Math.PI * 45;
  const strokeOffset = strokeDash - (strokeDash * fitPercent) / 100;

  // Determine fit color
  let fitColor = "#10b981"; // green
  if (fitPercent < 60) fitColor = "#f43f5e"; // red
  else if (fitPercent < 75) fitColor = "#f59e0b"; // amber

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Top Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "28px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span className="badge badge-emerald">Step 2 of 4</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Candidate Fit Assessment</span>
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            {candidateData.candidate_name || "Candidate"} vs {roleData?.role_title || "Target Role"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Evaluating resume claims, technical parity, strengths, and preparation gaps.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Role Analysis
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              voiceManager.warmup();
              onStartInterview();
            }}
            style={{ boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)" }}
          >
            <Play size={16} />
            <span>Launch AI Interview Simulator</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid: Job Fit Gauge & Highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        
        {/* Job Fit Gauge Card */}
        <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
            Your Job Fit Score
          </div>

          {/* Radial Circular SVG Gauge */}
          <div style={{ position: "relative", width: "140px", height: "140px", margin: "10px 0 20px" }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="10"
              />
              <circle
                className="gauge-circle"
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={fitColor}
                strokeWidth="10"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                {fitPercent}%
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                Role Alignment
              </span>
            </div>
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, maxWidth: "420px" }}>
            {jobFit.summary}
          </p>
        </div>

        {/* Fit Match Breakdown: Strong / Partial / Missing */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "18px" }}>
            Skill Match Breakdown
          </h2>

          {/* Strong Match */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#34d399", fontWeight: 700, marginBottom: "8px" }}>
              <CheckCircle size={15} /> Strong Match (Direct Evidence in Resume)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {jobFit.strong_match.map((item, idx) => (
                <span key={idx} className="badge badge-emerald" style={{ fontSize: "0.85rem" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Partial Match */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#fbbf24", fontWeight: 700, marginBottom: "8px" }}>
              <AlertTriangle size={15} /> Partial Match / Related Experience
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {jobFit.partial_match.map((item, idx) => (
                <span key={idx} className="badge badge-amber" style={{ fontSize: "0.85rem" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Missing / Weak */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#fda4af", fontWeight: 700, marginBottom: "8px" }}>
              <XCircle size={15} /> Missing / Weak Areas
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {jobFit.missing_weak.map((item, idx) => (
                <span key={idx} className="badge badge-rose" style={{ fontSize: "0.85rem" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Flagged Claims & Potential Probing Questions (Assignment Spec Highlight) */}
      <div style={{
        background: "rgba(245, 158, 11, 0.08)",
        border: "1px solid rgba(245, 158, 11, 0.3)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        marginBottom: "28px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <ShieldAlert size={22} color="#fbbf24" />
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fef3c7" }}>
            Potential Resume Claims Flagged for Interview Probing
          </h3>
        </div>
        <p style={{ fontSize: "0.86rem", color: "#fde68a", marginBottom: "14px" }}>
          The AI Interviewer has identified these specific project and metric claims in your resume. In Level 2 and Level 3, the AI will test technical depth, baseline validity, and architecture choices.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {candidateData.potential_resume_claims.map((claim, idx) => (
            <div key={idx} style={{
              background: "rgba(18, 26, 44, 0.75)",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9rem",
              color: "#fff",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <span style={{ color: "#fbbf24", fontWeight: 700 }}>🔍</span>
              <span>{claim}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects & Strengths Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* Projects */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <FileCode size={18} color="#818cf8" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Candidate Key Projects</h3>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
            {candidateData.relevant_projects.map((proj, idx) => (
              <li key={idx} style={{ fontSize: "0.88rem", color: "var(--text-main)", background: "rgba(255, 255, 255, 0.03)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                {proj}
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths & Preparation Areas */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <Award size={18} color="#34d399" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Candidate Strengths & Prep Focus</h3>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>
              Strengths against JD
            </div>
            <ul style={{ paddingLeft: "18px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
              {candidateData.strengths_against_jd.map((st, idx) => (
                <li key={idx}><strong style={{ color: "var(--text-main)" }}>{st}</strong></li>
              ))}
            </ul>
          </div>

          <div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>
              Preparation Areas to Review
            </div>
            <ul style={{ paddingLeft: "18px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
              {candidateData.preparation_areas.map((ar, idx) => (
                <li key={idx}>{ar}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Launch Banner */}
      <div className="glass-panel" style={{
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "20px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.1))",
        borderColor: "rgba(99, 102, 241, 0.3)"
      }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "4px" }}>
            Ready for Step 3: AI Interview Simulator?
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
            Experience 3 progressive interview levels (Screening → Competency → Deep-Dive) with voice interaction and real-time behavioral telemetry.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={onStartInterview}
          style={{ padding: "14px 32px", fontSize: "1.05rem", borderRadius: "var(--radius-full)" }}
        >
          <Play size={18} />
          <span>Start AI Interview Simulator</span>
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}
