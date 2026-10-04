import React from "react";
import { Briefcase, CheckCircle2, Star, Layers, Users, Clock, Key, Lightbulb, ArrowRight, ArrowLeft } from "lucide-react";

export default function RoleAnalysisScreen({ roleData, onNext, onBack }) {
  if (!roleData) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Header Banner */}
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
            <span className="badge badge-primary">Step 1 of 4</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Role Decomposition</span>
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            {roleData.role_title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            <span className="badge badge-cyan" style={{ fontSize: "0.82rem" }}>
              <Clock size={13} /> {roleData.experience_expectations}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Edit Documents
          </button>
          <button className="btn btn-primary" onClick={onNext}>
            <span>View Candidate Fit</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid Dashboard */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        
        {/* Key Responsibilities */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={18} color="#818cf8" />
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Key Responsibilities</h2>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
            {roleData.key_responsibilities.map((resp, idx) => (
              <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.5 }}>
                <CheckCircle2 size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: "3px" }} />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Required & Preferred Skills */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Star size={18} color="#34d399" />
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Skills Breakdown</h2>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>
              Required Core Skills
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {roleData.required_skills.map((skill, idx) => (
                <span key={idx} className="badge badge-emerald" style={{ fontSize: "0.85rem", padding: "5px 12px" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>
              Preferred / Nice-to-Have Skills
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {roleData.preferred_skills.map((skill, idx) => (
                <span key={idx} className="badge badge-primary" style={{ fontSize: "0.85rem", padding: "5px 12px" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Competencies */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Layers size={18} color="#67e8f9" />
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Technical Competencies</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {roleData.technical_competencies.map((comp, idx) => (
              <div key={idx} style={{
                background: "rgba(255, 255, 255, 0.03)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ color: "#67e8f9", fontWeight: 600 }}>0{idx + 1}</span>
                <span>{comp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Behavioural Competencies */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={18} color="#fbbf24" />
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Behavioural Competencies</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {roleData.behavioural_competencies.map((beh, idx) => (
              <span key={idx} className="badge badge-amber" style={{ fontSize: "0.86rem", padding: "6px 14px" }}>
                {beh}
              </span>
            ))}
          </div>
        </div>

        {/* Important Concepts & Keywords */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lightbulb size={18} color="#c084fc" />
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Important Concepts & Keywords</h2>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>
              Core Technical Concepts
            </div>
            <ul style={{ paddingLeft: "18px", fontSize: "0.88rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
              {roleData.important_concepts.map((concept, idx) => (
                <li key={idx}><strong style={{ color: "var(--text-main)" }}>{concept}</strong></li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>
              Keywords
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {roleData.important_keywords.map((kw, idx) => (
                <span key={idx} style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontFamily: "var(--font-mono)",
                  color: "#cbd5e1"
                }}>
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Key Qualifications */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(244, 63, 94, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Key size={18} color="#fda4af" />
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Key Qualifications</h2>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {roleData.key_qualifications.map((qual, idx) => (
              <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.88rem", color: "var(--text-main)" }}>
                <span style={{ color: "#f43f5e", fontWeight: 700 }}>•</span>
                <span>{qual}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Nav CTA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Previous: Inputs
        </button>
        <button className="btn btn-primary" onClick={onNext} style={{ padding: "14px 28px", fontSize: "1rem" }}>
          <span>Next: Candidate Analysis & Job Fit</span>
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}
