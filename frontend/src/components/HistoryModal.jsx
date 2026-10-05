import React, { useState } from "react";
import {
  X, History, Trash2, Award, Calendar, ExternalLink,
  Database, User, TrendingUp, GitCompare, ArrowRight, CheckCircle2, ChevronRight
} from "lucide-react";

export default function HistoryModal({
  isOpen,
  onClose,
  historyList = [],
  onLoadReport,
  onDeleteHistoryItem,
  onClearHistory
}) {
  const [activeTab, setActiveTab] = useState("records"); // "records" | "progress"
  const [selectedSessionA, setSelectedSessionA] = useState("");
  const [selectedSessionB, setSelectedSessionB] = useState("");

  if (!isOpen) return null;

  // Chronologically sorted list (oldest to newest for trajectory)
  const chronologicalList = [...historyList].reverse();
  const latestSession = historyList[0];
  const oldestSession = historyList[historyList.length - 1];
  
  const scoreImprovement = (latestSession && oldestSession && historyList.length > 1)
    ? (Number(latestSession.overall_score || 0) - Number(oldestSession.overall_score || 0))
    : 0;

  // Sessions selected for side-by-side comparison
  const sessionA = historyList.find(s => s.session_id === (selectedSessionA || (historyList[1]?.session_id))) || historyList[1] || historyList[0];
  const sessionB = historyList.find(s => s.session_id === (selectedSessionB || (historyList[0]?.session_id))) || historyList[0];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "var(--modal-backdrop)",
      backdropFilter: "blur(10px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: "760px",
        padding: "26px",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border-subtle)",
        maxHeight: "88vh",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Database size={18} color="#818cf8" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                Interview History & Performance Analytics
              </h2>
              <span style={{ fontSize: "0.74rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                Persistent SQLite Database Storage
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-dim)",
              cursor: "pointer",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* View Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
          <button
            onClick={() => setActiveTab("records")}
            className={`btn ${activeTab === "records" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
          >
            <History size={13} /> All Sessions ({historyList.length})
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`btn ${activeTab === "progress" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
            disabled={historyList.length < 2}
            title={historyList.length < 2 ? "Complete at least 2 interviews to compare and track improvement" : "Track improvement and compare performance across interviews"}
          >
            <TrendingUp size={13} /> Progress & Comparison {historyList.length < 2 && "(Needs ≥2 Sessions)"}
          </button>
        </div>

        {/* Tab 1: Standard List of Previous Sessions */}
        {activeTab === "records" && (
          <div style={{ flex: 1, overflowY: "auto", margin: "4px 0 16px 0", paddingRight: "4px" }}>
            {(!historyList || historyList.length === 0) ? (
              <div style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "var(--text-dim)",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-subtle)"
              }}>
                <History size={36} color="var(--text-dim)" style={{ marginBottom: "12px", opacity: 0.5 }} />
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                  No Interview Records Yet
                </div>
                <div style={{ fontSize: "0.82rem", maxWidth: "380px", margin: "0 auto", lineHeight: 1.5 }}>
                  Complete a mock interview to have your scores, telemetry, AI critiques, and 5-day study plan automatically saved to the database.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {historyList.map((item, idx) => {
                  let badgeColor = "#10b981";
                  if (item.overall_score < 60) badgeColor = "#f43f5e";
                  else if (item.overall_score < 75) badgeColor = "#f59e0b";

                  return (
                    <div
                      key={item.session_id || idx}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        transition: "all 0.2s ease"
                      }}
                      className="glass-panel-interactive"
                    >
                      {/* Left: Role, Candidate, Date */}
                      <div
                        onClick={() => {
                          onLoadReport(item);
                          onClose();
                        }}
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>
                            {item.role_title || "Technical Interview"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          {item.candidate_name && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#93c5fd" }}>
                              <User size={12} /> {item.candidate_name}
                            </span>
                          )}
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={12} /> {item.interview_date || "Past Session"}
                          </span>
                          {item.readiness_assessment && (
                            <span style={{
                              fontSize: "0.72rem",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid var(--border-subtle)"
                            }}>
                              {item.readiness_assessment}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Score, Load, Delete */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          onClick={() => {
                            onLoadReport(item);
                            onClose();
                          }}
                          style={{ textAlign: "right", cursor: "pointer" }}
                        >
                          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: badgeColor, fontFamily: "var(--font-heading)" }}>
                            {item.overall_score}%
                          </div>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Score
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            onLoadReport(item);
                            onClose();
                          }}
                          title="View Full Report"
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "5px" }}
                        >
                          <ExternalLink size={13} /> View
                        </button>

                        {onDeleteHistoryItem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete record for "${item.role_title}"?`)) {
                                onDeleteHistoryItem(item.session_id);
                              }
                            }}
                            title="Delete Record"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#f87171",
                              cursor: "pointer",
                              padding: "6px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0.7,
                              transition: "opacity 0.2s ease"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Progress & Comparison */}
        {activeTab === "progress" && (
          <div style={{ flex: 1, overflowY: "auto", margin: "4px 0 16px 0", paddingRight: "4px" }}>
            
            {/* Growth Highlight Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.12))",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Candidate Growth Trajectory
                </span>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>
                  {scoreImprovement >= 0 ? `+${scoreImprovement}% Score Improvement` : `${scoreImprovement}% Score Variation`}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "2px" }}>
                  Measured across {historyList.length} completed mock interview sessions
                </div>
              </div>

              {/* Sparkline Visualization */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "48px" }}>
                {chronologicalList.map((item, idx) => {
                  const score = Number(item.overall_score || 0);
                  const barHeight = Math.max(15, (score / 100) * 44);
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }} title={`Attempt ${idx + 1}: ${score}%`}>
                      <span style={{ fontSize: "0.62rem", color: "var(--text-dim)" }}>{score}%</span>
                      <div style={{
                        width: "14px",
                        height: `${barHeight}px`,
                        borderRadius: "3px 3px 0 0",
                        background: idx === chronologicalList.length - 1 ? "#34d399" : "#6366f1"
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side-by-Side Comparison Selector */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <GitCompare size={14} color="#818cf8" /> Compare Two Interviews Side-by-Side
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>Session A (Baseline):</label>
                  <select
                    value={sessionA?.session_id || ""}
                    onChange={(e) => setSelectedSessionA(e.target.value)}
                    className="textarea-custom"
                    style={{ height: "36px", padding: "4px 8px", fontSize: "0.78rem" }}
                  >
                    {historyList.map(s => (
                      <option key={s.session_id} value={s.session_id}>
                        {s.role_title} ({s.overall_score}% • {s.interview_date || "Recent"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>Session B (Latest / Comparison):</label>
                  <select
                    value={sessionB?.session_id || ""}
                    onChange={(e) => setSelectedSessionB(e.target.value)}
                    className="textarea-custom"
                    style={{ height: "36px", padding: "4px 8px", fontSize: "0.78rem" }}
                  >
                    {historyList.map(s => (
                      <option key={s.session_id} value={s.session_id}>
                        {s.role_title} ({s.overall_score}% • {s.interview_date || "Recent"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Comparison Cards Diff */}
            {sessionA && sessionB && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                background: "rgba(10, 14, 23, 0.4)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)"
              }}>
                {/* Session A */}
                <div style={{ borderRight: "1px solid var(--border-subtle)", paddingRight: "12px" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Session A</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>{sessionA.role_title}</div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>{sessionA.interview_date || "Recorded Session"}</div>
                  
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "12px" }}>
                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#818cf8" }}>{sessionA.overall_score}%</span>
                    <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{sessionA.readiness_assessment}</span>
                  </div>

                  <button
                    onClick={() => { onLoadReport(sessionA); onClose(); }}
                    className="btn btn-secondary"
                    style={{ marginTop: "12px", width: "100%", padding: "5px 10px", fontSize: "0.76rem" }}
                  >
                    Open Session A Report
                  </button>
                </div>

                {/* Session B */}
                <div style={{ paddingLeft: "6px" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Session B</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>{sessionB.role_title}</div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>{sessionB.interview_date || "Recorded Session"}</div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "12px" }}>
                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: Number(sessionB.overall_score) >= Number(sessionA.overall_score) ? "#34d399" : "#fbbf24" }}>
                      {sessionB.overall_score}%
                    </span>
                    <span style={{
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      color: Number(sessionB.overall_score) >= Number(sessionA.overall_score) ? "#34d399" : "#f43f5e"
                    }}>
                      {Number(sessionB.overall_score) - Number(sessionA.overall_score) >= 0 ? `+${Number(sessionB.overall_score) - Number(sessionA.overall_score)}%` : `${Number(sessionB.overall_score) - Number(sessionA.overall_score)}%`}
                    </span>
                  </div>

                  <button
                    onClick={() => { onLoadReport(sessionB); onClose(); }}
                    className="btn btn-secondary"
                    style={{ marginTop: "12px", width: "100%", padding: "5px 10px", fontSize: "0.76rem" }}
                  >
                    Open Session B Report
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
          {historyList && historyList.length > 0 && activeTab === "records" ? (
            <button
              onClick={onClearHistory}
              style={{
                background: "transparent",
                border: "none",
                color: "#fda4af",
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px"
              }}
            >
              <Trash2 size={14} /> Clear All History
            </button>
          ) : (
            <div></div>
          )}
          <button className="btn btn-secondary" onClick={onClose} style={{ marginLeft: "auto" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
