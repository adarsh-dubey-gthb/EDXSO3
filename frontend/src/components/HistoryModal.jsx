import React from "react";
import { X, History, Trash2, Award, Calendar, ExternalLink, Database, User } from "lucide-react";

export default function HistoryModal({
  isOpen,
  onClose,
  historyList = [],
  onLoadReport,
  onDeleteHistoryItem,
  onClearHistory
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.78)",
      backdropFilter: "blur(10px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: "650px",
        padding: "30px",
        background: "rgba(15, 23, 42, 0.96)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "34px",
                height: "34px",
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
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                  Interview History & Records
                </h2>
                <span style={{ fontSize: "0.74rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                  Persistent SQLite Database Storage
                </span>
              </div>
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

        {/* List of Previous Sessions */}
        <div style={{ flex: 1, overflowY: "auto", margin: "10px 0 20px 0", paddingRight: "4px" }}>
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
                      padding: "16px 18px",
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
                        <span style={{ fontSize: "1.02rem", fontWeight: 700, color: "#ffffff" }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div
                        onClick={() => {
                          onLoadReport(item);
                          onClose();
                        }}
                        style={{ textAlign: "right", cursor: "pointer" }}
                      >
                        <div style={{ fontSize: "1.35rem", fontWeight: 800, color: badgeColor, fontFamily: "var(--font-heading)" }}>
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

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
          {historyList && historyList.length > 0 ? (
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
