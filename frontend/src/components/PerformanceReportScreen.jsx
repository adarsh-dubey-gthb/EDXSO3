import React, { useEffect } from "react";
import {
  Award, CheckCircle2, AlertTriangle, AlertCircle, XCircle,
  Printer, ArrowLeft, RotateCcw, Share2, Compass, BookmarkCheck,
  TrendingUp, Gauge, MessageSquare, ChevronDown
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PerformanceReportScreen({ report, onRestart, onSaveHistory }) {
  useEffect(() => {
    // Launch celebratory confetti when the report is rendered
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  if (!report) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div className="waveform-container" style={{ margin: "0 auto 20px" }}>
          <span className="waveform-bar"></span>
          <span className="waveform-bar"></span>
          <span className="waveform-bar"></span>
        </div>
        <p style={{ color: "var(--text-muted)" }}>Synthesizing comprehensive interview performance report...</p>
      </div>
    );
  }

  const overallScore = report.overall_score || 76;
  const strokeDash = 2 * Math.PI * 52;
  const strokeOffset = strokeDash - (strokeDash * overallScore) / 100;

  let scoreColor = "#10b981"; // green
  if (overallScore < 60) scoreColor = "#f43f5e";
  else if (overallScore < 75) scoreColor = "#f59e0b";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 20px" }}>
      
      {/* Top Action Header */}
      <div className="no-print" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "28px",
        flexWrap: "wrap",
        gap: "14px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span className="badge badge-emerald">Final Assessment</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{report.interview_date || "Today"}</span>
          </div>
          <h1 style={{ fontSize: "2.3rem", fontWeight: 800 }}>
            Interview Performance Report
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={onSaveHistory}>
            <BookmarkCheck size={16} color="#34d399" />
            <span>Save to History</span>
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print / Export PDF</span>
          </button>
          <button className="btn btn-primary" onClick={onRestart}>
            <RotateCcw size={16} />
            <span>Retake / New Practice</span>
          </button>
        </div>
      </div>

      {/* Main Score & Readiness Hero Card */}
      <div className="glass-panel" style={{
        padding: "36px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "32px",
        alignItems: "center",
        marginBottom: "32px",
        background: "linear-gradient(135deg, rgba(18, 24, 38, 0.85), rgba(14, 18, 27, 0.95))"
      }}>
        
        {/* Left: Circular Overall Score Radial Meter */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ position: "relative", width: "160px", height: "160px", marginBottom: "12px" }}>
            <svg width="160" height="160" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="12"
              />
              <circle
                className="gauge-circle"
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke={scoreColor}
                strokeWidth="12"
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
              <span style={{ fontSize: "2.4rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                {overallScore}
              </span>
              <span style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                Out of 100
              </span>
            </div>
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>Overall Interview Score</div>
        </div>

        {/* Right: Interview Readiness Verdict (Section 15 of Spec) */}
        <div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
            Interview Readiness Assessment
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              padding: "6px 18px",
              borderRadius: "var(--radius-full)",
              background: report.readiness_badge_color === "green" ? "rgba(16, 185, 129, 0.15)" : report.readiness_badge_color === "yellow" ? "rgba(245, 158, 11, 0.15)" : "rgba(244, 63, 94, 0.15)",
              border: `1px solid ${scoreColor}`,
              color: scoreColor
            }}>
              {report.readiness_assessment}
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "16px" }}>
            {report.readiness_summary}
          </p>

          {/* Quick Speech Metrics Banner */}
          {report.speech_analytics && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "10px 16px",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.82rem",
              flexWrap: "wrap"
            }}>
              <div>
                <span style={{ color: "var(--text-dim)" }}>Average Pace: </span>
                <strong>{report.speech_analytics.average_wpm} WPM</strong> ({report.speech_analytics.pace_rating})
              </div>
              <div>
                <span style={{ color: "var(--text-dim)" }}>Filler Words: </span>
                <strong style={{ color: report.speech_analytics.total_filler_words > 5 ? "#fda4af" : "#6ee7b7" }}>
                  {report.speech_analytics.total_filler_words} detected
                </strong>
              </div>
              <div>
                <span style={{ color: "var(--text-dim)" }}>Confidence Index: </span>
                <strong style={{ color: "#818cf8" }}>{report.speech_analytics.confidence_index}</strong>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Competency Scores Breakdown (Section 8 of Spec) */}
      <div className="glass-panel" style={{ padding: "28px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <TrendingUp size={20} color="#818cf8" />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Competency Scores Evaluation</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {Object.entries(report.competency_scores || {}).map(([compName, score]) => {
            let barColor = "#10b981";
            if (score < 60) barColor = "#f43f5e";
            else if (score < 75) barColor = "#f59e0b";

            return (
              <div key={compName} style={{
                background: "rgba(255, 255, 255, 0.02)",
                padding: "14px 18px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.88rem", fontWeight: 600 }}>
                  <span>{compName}</span>
                  <span style={{ color: barColor, fontWeight: 700 }}>{score}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{
                    width: `${score}%`,
                    height: "100%",
                    background: barColor,
                    borderRadius: "4px",
                    transition: "width 0.8s ease"
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question-Level Feedback (Section 11 of Spec - Critical Requirement) */}
      <div className="glass-panel" style={{ padding: "28px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <MessageSquare size={20} color="#34d399" />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Question-by-Question Deep Feedback</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {report.question_feedbacks?.map((qf, idx) => (
            <div key={idx} style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "22px"
            }}>
              {/* Question Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <span className="badge badge-primary" style={{ fontSize: "0.78rem" }}>
                  Question #{qf.question_index} • {qf.level_name}
                </span>
                <span className="badge badge-emerald" style={{ fontSize: "0.78rem" }}>
                  Score: {qf.assessment_score}/100 ({qf.rating})
                </span>
              </div>

              {/* What the AI Asked */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "0.76rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                  What the AI Asked
                </div>
                <div style={{ fontSize: "0.98rem", color: "#f8fafc", fontWeight: 600 }}>
                  "{qf.question}"
                </div>
              </div>

              {/* Candidate Spoken Answer */}
              <div style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(10, 14, 23, 0.7)", borderRadius: "var(--radius-md)", borderLeft: "3px solid #6366f1" }}>
                <div style={{ fontSize: "0.76rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                  Your Spoken Answer
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
                  "{qf.candidate_answer || 'No answer recorded.'}"
                </div>
              </div>

              {/* 3 Pillars of Actionable Feedback */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
                {/* What Was Good */}
                <div style={{ background: "rgba(16, 185, 129, 0.07)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6ee7b7", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={14} /> What Was Good
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-main)", lineHeight: 1.45 }}>
                    {qf.what_was_good}
                  </div>
                </div>

                {/* What Could Be Better (Actionable, Non-Generic) */}
                <div style={{ background: "rgba(245, 158, 11, 0.07)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#fbbf24", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={14} /> What Could Be Better
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-main)", lineHeight: 1.45 }}>
                    {qf.what_could_be_better}
                  </div>
                </div>

                {/* Ideal Direction / Model Response */}
                <div style={{ background: "rgba(99, 102, 241, 0.07)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#a5b4fc", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Compass size={14} /> Ideal Direction / Stronger Response
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-main)", lineHeight: 1.45 }}>
                    {qf.ideal_direction}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses (Sections 12 & 13 of Spec) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* Strengths */}
        <div className="glass-panel" style={{ padding: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Award size={20} color="#34d399" />
            <h2 style={{ fontSize: "1.18rem", fontWeight: 700 }}>Demonstrated Strengths</h2>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
            {report.strengths?.map((st, idx) => (
              <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem", color: "var(--text-main)" }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass-panel" style={{ padding: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <AlertCircle size={20} color="#fda4af" />
            <h2 style={{ fontSize: "1.18rem", fontWeight: 700 }}>Identified Weaknesses</h2>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
            {report.weaknesses?.map((wk, idx) => (
              <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem", color: "var(--text-main)" }}>
                <XCircle size={16} color="#f43f5e" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Prioritized Preparation Gaps (Section 14 of Spec - Priority 1, 2, 3) */}
      <div className="glass-panel" style={{ padding: "28px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Compass size={20} color="#fbbf24" />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Prioritized Preparation Gaps & Review Roadmap</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {report.preparation_gaps?.map((gap, idx) => (
            <div key={idx} style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span className={`badge ${gap.priority === 1 ? 'badge-rose' : gap.priority === 2 ? 'badge-amber' : 'badge-primary'}`}>
                  Priority {gap.priority}
                </span>
                <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", textTransform: "uppercase" }}>{gap.category}</span>
              </div>

              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "12px", color: "#f8fafc" }}>
                {gap.title}
              </h3>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                  Topics to Review:
                </div>
                <ul style={{ paddingLeft: "18px", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {gap.review_topics.map((t, tidx) => (
                    <li key={tidx}>{t}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                  Actionable Next Steps:
                </div>
                <div style={{ fontSize: "0.84rem", color: "#a5b4fc" }}>
                  {gap.action_items.join(" • ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus Feature: AI-Generated 5-Day Study Plan */}
      {report.study_plan && (
        <div className="glass-panel" style={{ padding: "28px", marginBottom: "36px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "18px" }}>
            Personalized Actionable Study Schedule
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {report.study_plan.map((item, idx) => (
              <div key={idx} style={{
                background: "rgba(255, 255, 255, 0.03)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span className="badge badge-primary">{item.day_or_step}</span>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-dim)" }}>Milestone</span>
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "8px", color: "#ffffff" }}>
                  {item.focus}
                </div>
                <ul style={{ paddingLeft: "16px", fontSize: "0.84rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                  {item.tasks.map((task, tidx) => (
                    <li key={tidx}>{task}</li>
                  ))}
                </ul>
                <div style={{ fontSize: "0.76rem", color: "#818cf8" }}>
                  📚 Resources: {item.recommended_resources.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="no-print" style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "20px" }}>
        <button className="btn btn-secondary" onClick={handlePrint} style={{ padding: "12px 24px" }}>
          <Printer size={16} /> Print / Save PDF Report
        </button>
        <button className="btn btn-primary" onClick={onRestart} style={{ padding: "12px 32px" }}>
          <RotateCcw size={16} /> Start Another Session
        </button>
      </div>

    </div>
  );
}
