import React, { useState } from "react";
import {
  Users, Search, Filter, Download, CheckCircle2, AlertCircle,
  XCircle, TrendingUp, Award, Calendar, ExternalLink, X, ShieldCheck
} from "lucide-react";

export default function RecruiterModal({
  isOpen,
  onClose,
  historyList = [],
  onLoadReport
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [readinessFilter, setReadinessFilter] = useState("all");

  if (!isOpen) return null;

  // Filter candidates
  const filteredCandidates = historyList.filter(item => {
    const matchesSearch =
      (item.candidate_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.role_title || "").toLowerCase().includes(searchQuery.toLowerCase());

    const score = Number(item.overall_score || 0);
    const matchesScore = score >= minScoreFilter;

    const matchesReadiness =
      readinessFilter === "all" ||
      (item.readiness_assessment || "").toLowerCase().includes(readinessFilter.toLowerCase());

    return matchesSearch && matchesScore && matchesReadiness;
  });

  // Calculate high-level recruiter metrics
  const totalEvaluated = historyList.length;
  const avgScore = totalEvaluated > 0
    ? Math.round(historyList.reduce((acc, curr) => acc + (Number(curr.overall_score) || 0), 0) / totalEvaluated)
    : 0;
  const strongCandidates = historyList.filter(c => (Number(c.overall_score) || 0) >= 80).length;
  const hireRate = totalEvaluated > 0 ? Math.round((strongCandidates / totalEvaluated) * 100) : 0;

  // Export to CSV
  const handleExportCSV = () => {
    if (historyList.length === 0) return;
    const headers = ["Session ID", "Candidate Name", "Role Applied", "Interview Date", "Overall Score", "Readiness Assessment", "Recommendation"];
    const rows = historyList.map(item => {
      const score = Number(item.overall_score || 0);
      let rec = "Not Recommended";
      if (score >= 82) rec = "Recommend Hire";
      else if (score >= 70) rec = "Advance to Technical Round";
      else if (score >= 55) rec = "Needs Preparation";

      return [
        `"${item.session_id || ""}"`,
        `"${item.candidate_name || "Anonymous Candidate"}"`,
        `"${item.role_title || "Technical Role"}"`,
        `"${item.interview_date || ""}"`,
        score,
        `"${item.readiness_assessment || ""}"`,
        `"${rec}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Recruiter_Candidate_Evaluations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        maxWidth: "960px",
        maxHeight: "90vh",
        padding: "28px",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Users size={18} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                Recruiter & Talent Pipeline Dashboard
              </h2>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                <ShieldCheck size={13} color="#10b981" />
                Aggregated Candidate Interview Evaluations & Calibration Benchmarks
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
              disabled={historyList.length === 0}
              title="Export candidate roster to CSV"
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                cursor: "pointer",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Top Recruiter Metrics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          <div style={{ background: "var(--card-inner)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "14px" }}>
            <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Total Evaluated</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-main)", marginTop: "4px" }}>{totalEvaluated}</div>
          </div>
          <div style={{ background: "var(--card-inner)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "14px" }}>
            <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Average Score</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--primary)", marginTop: "4px" }}>{avgScore}/100</div>
          </div>
          <div style={{ background: "var(--card-inner)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "14px" }}>
            <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Benchmark Qualified (≥80)</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--emerald)", marginTop: "4px" }}>{strongCandidates}</div>
          </div>
          <div style={{ background: "var(--card-inner)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "14px" }}>
            <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Pass Calibration Rate</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#67e8f9", marginTop: "4px" }}>{hireRate}%</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "rgba(10, 14, 23, 0.5)",
          padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "16px",
          flexWrap: "wrap"
        }}>
          {/* Search box */}
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search size={14} color="var(--text-dim)" style={{ position: "absolute", left: "10px", top: "11px" }} />
            <input
              type="text"
              placeholder="Search by candidate name or role title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="textarea-custom"
              style={{ height: "36px", padding: "6px 10px 6px 32px", fontSize: "0.82rem" }}
            />
          </div>

          {/* Min score filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", whiteSpace: "nowrap" }}>Min Score:</span>
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="textarea-custom"
              style={{ height: "36px", padding: "4px 8px", fontSize: "0.8rem", width: "100px" }}
            >
              <option value={0}>All Scores</option>
              <option value={60}>≥ 60 (Passing)</option>
              <option value={75}>≥ 75 (Senior)</option>
              <option value={85}>≥ 85 (Staff / Lead)</option>
            </select>
          </div>

          {/* Readiness Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", whiteSpace: "nowrap" }}>Status:</span>
            <select
              value={readinessFilter}
              onChange={(e) => setReadinessFilter(e.target.value)}
              className="textarea-custom"
              style={{ height: "36px", padding: "4px 8px", fontSize: "0.8rem", width: "130px" }}
            >
              <option value="all">All Statuses</option>
              <option value="Strong Candidate">Strong Candidate</option>
              <option value="Interview Ready">Interview Ready</option>
              <option value="Needs Preparation">Needs Preparation</option>
              <option value="Not Ready">Not Ready</option>
            </select>
          </div>
        </div>

        {/* Candidate List Table */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
          {filteredCandidates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-dim)" }}>
              No candidates found matching the active filter criteria.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredCandidates.map((c, i) => {
                const score = Number(c.overall_score || 0);
                let recBadge = { label: "Needs Prep", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
                if (score >= 82) recBadge = { label: "Recommend Hire", color: "#34d399", bg: "rgba(16, 185, 129, 0.15)" };
                else if (score >= 70) recBadge = { label: "Advance to Next Round", color: "#818cf8", bg: "rgba(99, 102, 241, 0.15)" };
                else if (score < 55) recBadge = { label: "Do Not Advance", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)" };

                return (
                  <div
                    key={c.session_id || i}
                    style={{
                      background: "rgba(255, 255, 255, 0.025)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      transition: "all 0.2s ease"
                    }}
                    className="glass-panel-interactive"
                  >
                    {/* Candidate & Role */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                          {c.candidate_name || "Anonymous Candidate"}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          • {c.role_title || "Technical Position"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", fontSize: "0.74rem", color: "var(--text-dim)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={11} /> {c.interview_date || "Recent"}
                        </span>
                        <span>{c.readiness_assessment || "Evaluated"}</span>
                      </div>
                    </div>

                    {/* Recommendation Pill */}
                    <span style={{
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "var(--radius-full)",
                      background: recBadge.bg,
                      color: recBadge.color,
                      border: `1px solid ${recBadge.color}33`,
                      whiteSpace: "nowrap"
                    }}>
                      {recBadge.label}
                    </span>

                    {/* Score Gauge */}
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: score >= 80 ? "rgba(16, 185, 129, 0.15)" : score >= 70 ? "rgba(99, 102, 241, 0.15)" : "rgba(244, 63, 94, 0.15)",
                      border: `2px solid ${score >= 80 ? "#10b981" : score >= 70 ? "#818cf8" : "#f43f5e"}`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.86rem",
                      color: "var(--text-main)"
                    }}>
                      {score}
                    </div>

                    {/* View Report Button */}
                    <button
                      onClick={() => {
                        onLoadReport(c);
                        onClose();
                      }}
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "0.76rem" }}
                      title="View complete evaluation report"
                    >
                      <ExternalLink size={12} /> View Report
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
