import React, { useState, useEffect, useRef } from "react";
import {
  Bot, User, Sparkles, Volume2, VolumeX, Play, Square,
  Radio, Cpu, Eye, Waves, CheckCircle2, RefreshCw
} from "lucide-react";

const PERSONA_CONFIGS = {
  "Professional & Rigorous": {
    name: "Dr. Evelyn Vance",
    role: "Senior Staff Bar Raiser",
    style: "System Architecture & Deep Trade-offs",
    theme: "indigo",
    accentColor: "#818cf8",
    coreGradient: ["#4f46e5", "#7c3aed", "#06b6d4"],
    ringColor: "rgba(129, 140, 248, 0.45)",
    particleColor: "rgba(165, 180, 252, 0.8)",
    skinTone: "#f5d0b5",
    hairColor: "#334155",
    suitColor: "#1e293b",
    shirtColor: "#e2e8f0",
    hasGlasses: true,
  },
  "Supportive Coach": {
    name: "Marcus Reed",
    role: "Lead Technical Mentor",
    style: "Structured Problem Solving & Clarity",
    theme: "emerald",
    accentColor: "#34d399",
    coreGradient: ["#059669", "#10b981", "#06b6d4"],
    ringColor: "rgba(52, 211, 153, 0.45)",
    particleColor: "rgba(110, 231, 183, 0.8)",
    skinTone: "#fcd34d",
    hairColor: "#1e293b",
    suitColor: "#0f766e",
    shirtColor: "#ccfbf1",
    hasGlasses: false,
  },
  "Strict Tech Lead": {
    name: "Alex Thorne",
    role: "Principal Systems Architect",
    style: "Edge Cases, Scalability & Failure Modes",
    theme: "amber",
    accentColor: "#fbbf24",
    coreGradient: ["#d97706", "#f59e0b", "#ef4444"],
    ringColor: "rgba(251, 191, 36, 0.45)",
    particleColor: "rgba(252, 211, 77, 0.8)",
    skinTone: "#fed7aa",
    hairColor: "#475569",
    suitColor: "#18181b",
    shirtColor: "#fef3c7",
    hasGlasses: true,
  }
};

function getPersonaConfig(personaStr) {
  if (!personaStr) return PERSONA_CONFIGS["Professional & Rigorous"];
  if (personaStr.includes("Coach")) return PERSONA_CONFIGS["Supportive Coach"];
  if (personaStr.includes("Strict")) return PERSONA_CONFIGS["Strict Tech Lead"];
  return PERSONA_CONFIGS["Professional & Rigorous"];
}

export default function AIInterviewerStage({
  isSpeakingAI,
  isListeningCandidate,
  audioLevel = 0,
  isSubmitting = false,
  isTranscribingAI = false,
  persona = "Professional & Rigorous",
  currentQuestion = "",
  onReplayAudio,
  difficultyTag = "Standard"
}) {
  const config = getPersonaConfig(persona);

  // Display mode: "avatar" (Digital AI Humanoid) vs "neural" (Audio-Reactive Neural Hologram)
  const [displayMode, setDisplayMode] = useState(() => {
    return localStorage.getItem("ai_interviewer_mode") || "avatar";
  });

  const handleToggleMode = (mode) => {
    setDisplayMode(mode);
    localStorage.setItem("ai_interviewer_mode", mode);
  };

  // Blinking timer state for Digital Persona Avatar
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Canvas ref for Neural Hologram mode
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  useEffect(() => {
    if (displayMode !== "neural") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 460;
    const height = canvas.clientHeight || 260;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize orbital particles
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: 35 + Math.random() * 95,
      speed: 0.008 + Math.random() * 0.015,
      radius: 1 + Math.random() * 2.2,
      opacity: 0.2 + Math.random() * 0.7,
      orbitTilt: (Math.random() - 0.5) * 0.7
    }));

    let t = 0;

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 1. Cyber Ambient Background & Grid
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) / 1.5);
      if (isSpeakingAI) {
        bgGrad.addColorStop(0, "rgba(99, 102, 241, 0.22)");
        bgGrad.addColorStop(0.5, "rgba(79, 70, 229, 0.08)");
        bgGrad.addColorStop(1, "rgba(10, 14, 23, 0.95)");
      } else if (isListeningCandidate) {
        bgGrad.addColorStop(0, "rgba(16, 185, 129, 0.22)");
        bgGrad.addColorStop(0.5, "rgba(5, 150, 105, 0.08)");
        bgGrad.addColorStop(1, "rgba(10, 14, 23, 0.95)");
      } else if (isSubmitting || isTranscribingAI) {
        bgGrad.addColorStop(0, "rgba(245, 158, 11, 0.22)");
        bgGrad.addColorStop(0.5, "rgba(217, 119, 6, 0.08)");
        bgGrad.addColorStop(1, "rgba(10, 14, 23, 0.95)");
      } else {
        bgGrad.addColorStop(0, "rgba(30, 41, 59, 0.3)");
        bgGrad.addColorStop(1, "rgba(10, 14, 23, 0.95)");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle target HUD elements
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      // Corner brackets
      const bLen = 14;
      ctx.beginPath();
      // Top left
      ctx.moveTo(14, 14 + bLen); ctx.lineTo(14, 14); ctx.lineTo(14 + bLen, 14);
      // Top right
      ctx.moveTo(width - 14 - bLen, 14); ctx.lineTo(width - 14, 14); ctx.lineTo(width - 14, 14 + bLen);
      // Bottom left
      ctx.moveTo(14, height - 14 - bLen); ctx.lineTo(14, height - 14); ctx.lineTo(14 + bLen, height - 14);
      // Bottom right
      ctx.moveTo(width - 14 - bLen, height - 14); ctx.lineTo(width - 14, height - 14); ctx.lineTo(width - 14, height - 14 - bLen);
      ctx.stroke();

      // 2. Multi-tier Orbital Rings (3D Perspective Tilts)
      const ringTiers = [
        { rx: 110, ry: 40, tilt: 0.35, rotSpeed: 0.015, color: config.ringColor, width: 1.5 },
        { rx: 90, ry: 55, tilt: -0.5, rotSpeed: -0.018, color: "rgba(6, 182, 212, 0.4)", width: 1.2 },
        { rx: 125, ry: 30, tilt: 0.8, rotSpeed: 0.009, color: "rgba(147, 51, 234, 0.35)", width: 1.0 }
      ];

      // Dynamic expansion factor
      let expansion = 1;
      if (isSpeakingAI) {
        expansion = 1 + Math.sin(t * 5) * 0.12;
      } else if (isListeningCandidate) {
        expansion = 1 + Math.min(audioLevel * 0.6, 0.35);
      } else if (isSubmitting || isTranscribingAI) {
        expansion = 1 + Math.sin(t * 8) * 0.18;
      }

      ringTiers.forEach((ring, idx) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ring.tilt + Math.sin(t * 0.5) * 0.05);

        ctx.beginPath();
        ctx.ellipse(0, 0, ring.rx * expansion, ring.ry * expansion, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;
        ctx.stroke();

        // Orbiting glowing node
        const nodeAngle = t * (ring.rotSpeed * (isSpeakingAI ? 2.5 : isSubmitting ? 3.5 : 1)) + (idx * Math.PI * 0.7);
        const nodeX = Math.cos(nodeAngle) * (ring.rx * expansion);
        const nodeY = Math.sin(nodeAngle) * (ring.ry * expansion);

        ctx.beginPath();
        ctx.arc(nodeX, nodeY, isSpeakingAI ? 3.8 : 2.6, 0, Math.PI * 2);
        ctx.fillStyle = config.accentColor;
        ctx.shadowColor = config.accentColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      // 3. Floating Neural Particles
      particles.forEach((p) => {
        p.angle += p.speed * (isSpeakingAI ? 1.8 : isSubmitting ? 2.5 : 1);
        const px = cx + Math.cos(p.angle) * p.distance * expansion;
        const py = cy + Math.sin(p.angle) * (p.distance * 0.55 * (1 + p.orbitTilt)) * expansion;

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = config.particleColor;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 4. Central Audio-Reactive Neural Core
      let coreRadius = 40;
      if (isSpeakingAI) {
        coreRadius = 40 + Math.sin(t * 6) * 7 + Math.cos(t * 11) * 3;
      } else if (isListeningCandidate) {
        coreRadius = 38 + Math.min(audioLevel * 45, 30);
      } else if (isSubmitting || isTranscribingAI) {
        coreRadius = 40 + Math.sin(t * 12) * 5;
      } else {
        coreRadius = 38 + Math.sin(t * 1.5) * 2.5; // calm breathing
      }

      // Outer Core Glow
      const coreGlow = ctx.createRadialGradient(cx, cy, coreRadius * 0.2, cx, cy, coreRadius * 1.7);
      if (isSpeakingAI) {
        coreGlow.addColorStop(0, "#a5b4fc");
        coreGlow.addColorStop(0.3, "#6366f1");
        coreGlow.addColorStop(0.7, "rgba(79, 70, 229, 0.45)");
        coreGlow.addColorStop(1, "rgba(99, 102, 241, 0)");
      } else if (isListeningCandidate) {
        coreGlow.addColorStop(0, "#a7f3d0");
        coreGlow.addColorStop(0.3, "#10b981");
        coreGlow.addColorStop(0.7, "rgba(16, 185, 129, 0.45)");
        coreGlow.addColorStop(1, "rgba(16, 185, 129, 0)");
      } else if (isSubmitting || isTranscribingAI) {
        coreGlow.addColorStop(0, "#fde68a");
        coreGlow.addColorStop(0.3, "#f59e0b");
        coreGlow.addColorStop(0.7, "rgba(245, 158, 11, 0.45)");
        coreGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
      } else {
        coreGlow.addColorStop(0, "#c7d2fe");
        coreGlow.addColorStop(0.4, "#4f46e5");
        coreGlow.addColorStop(0.8, "rgba(79, 70, 229, 0.2)");
        coreGlow.addColorStop(1, "rgba(79, 70, 229, 0)");
      }

      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 1.7, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      // Inner Solid Core
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 0.85, 0, Math.PI * 2);
      const innerGrad = ctx.createLinearGradient(cx - coreRadius, cy - coreRadius, cx + coreRadius, cy + coreRadius);
      innerGrad.addColorStop(0, isSpeakingAI ? "#818cf8" : isListeningCandidate ? "#34d399" : isSubmitting ? "#fbbf24" : "#6366f1");
      innerGrad.addColorStop(1, isSpeakingAI ? "#4338ca" : isListeningCandidate ? "#065f46" : isSubmitting ? "#b45309" : "#312e81");
      ctx.fillStyle = innerGrad;
      ctx.fill();

      // Core Highlight Sparkle
      ctx.beginPath();
      ctx.arc(cx - coreRadius * 0.28, cy - coreRadius * 0.28, coreRadius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.fill();

      // 5. Audio-Reactive Sinusoidal Soundwave Ribbon
      ctx.beginPath();
      const wavePoints = 80;
      const waveWidth = width * 0.75;
      const startX = (width - waveWidth) / 2;

      for (let i = 0; i <= wavePoints; i++) {
        const wx = startX + (i / wavePoints) * waveWidth;
        const normX = (i / wavePoints) * 2 - 1; // -1 to 1
        const envelope = Math.max(0, 1 - normX * normX); // bell curve taper

        let amp = 0;
        if (isSpeakingAI) {
          amp = (Math.sin(t * 7 + i * 0.25) * 16 + Math.cos(t * 11 + i * 0.4) * 8) * envelope;
        } else if (isListeningCandidate) {
          amp = Math.sin(t * 5 + i * 0.3) * (audioLevel * 40 + 3) * envelope;
        } else if (isSubmitting || isTranscribingAI) {
          amp = Math.sin(t * 14 + i * 0.5) * 8 * envelope;
        } else {
          amp = Math.sin(t * 2 + i * 0.2) * 2.5 * envelope;
        }

        const wy = cy + amp;
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }

      ctx.strokeStyle = isSpeakingAI
        ? "rgba(199, 210, 254, 0.85)"
        : isListeningCandidate
        ? "rgba(110, 231, 183, 0.85)"
        : isSubmitting
        ? "rgba(253, 230, 138, 0.85)"
        : "rgba(165, 180, 252, 0.45)";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [displayMode, isSpeakingAI, isListeningCandidate, audioLevel, isSubmitting, isTranscribingAI, config]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "260px",
        height: "260px",
        background: "linear-gradient(180deg, rgba(14, 18, 27, 0.95) 0%, rgba(10, 14, 23, 0.98) 100%)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: isSpeakingAI
          ? "0 0 25px rgba(99, 102, 241, 0.25)"
          : isListeningCandidate
          ? "0 0 25px rgba(16, 185, 129, 0.25)"
          : "none",
        transition: "box-shadow 0.4s ease"
      }}
    >
      {/* Top Header Overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "12px",
          right: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10
        }}
      >
        {/* Live Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            background: "rgba(10, 14, 23, 0.82)",
            backdropFilter: "blur(8px)",
            padding: "5px 12px",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isSpeakingAI
                ? "#818cf8"
                : isListeningCandidate
                ? "#10b981"
                : isSubmitting || isTranscribingAI
                ? "#f59e0b"
                : "#64748b",
              boxShadow: isSpeakingAI
                ? "0 0 10px #818cf8"
                : isListeningCandidate
                ? "0 0 10px #10b981"
                : "none"
            }}
          />
          <span style={{ fontSize: "0.76rem", color: "var(--text-main)", fontWeight: 600 }}>
            {isSpeakingAI
              ? "AI Speaking Question..."
              : isListeningCandidate
              ? "AI Listening to You..."
              : isSubmitting || isTranscribingAI
              ? "Synthesizing Evaluation..."
              : "AI Interviewer Active"}
          </span>
        </div>

        {/* View Mode Toggle Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              display: "flex",
              background: "rgba(10, 14, 23, 0.82)",
              backdropFilter: "blur(8px)",
              padding: "2px",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <button
              onClick={() => handleToggleMode("avatar")}
              style={{
                background: displayMode === "avatar" ? "rgba(99, 102, 241, 0.3)" : "transparent",
                color: displayMode === "avatar" ? "#ffffff" : "var(--text-dim)",
                border: "none",
                borderRadius: "var(--radius-full)",
                padding: "3px 10px",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease"
              }}
              title="Switch to Digital Humanoid Persona Avatar"
            >
              <User size={12} /> Persona
            </button>
            <button
              onClick={() => handleToggleMode("neural")}
              style={{
                background: displayMode === "neural" ? "rgba(99, 102, 241, 0.3)" : "transparent",
                color: displayMode === "neural" ? "#ffffff" : "var(--text-dim)",
                border: "none",
                borderRadius: "var(--radius-full)",
                padding: "3px 10px",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease"
              }}
              title="Switch to Audio-Reactive Holographic Neural Sphere"
            >
              <Cpu size={12} /> Neural Core
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Stage (Canvas or Digital Persona) */}
      <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        
        {displayMode === "neural" ? (
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block"
            }}
          />
        ) : (
          /* Mode: Digital Persona Avatar */
          <div
            className={`ai-avatar-container ${isSpeakingAI ? "avatar-speaking-pulse" : ""} ${isListeningCandidate ? "avatar-attentive" : ""}`}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              background: "radial-gradient(circle at 50% 40%, rgba(30, 41, 59, 0.5) 0%, rgba(10, 14, 23, 0.95) 75%)"
            }}
          >
            {/* Background Holographic Studio Aura */}
            <div
              style={{
                position: "absolute",
                width: isSpeakingAI ? "190px" : "160px",
                height: isSpeakingAI ? "190px" : "160px",
                borderRadius: "50%",
                background: isSpeakingAI
                  ? "radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(124, 58, 237, 0.15) 50%, transparent 75%)"
                  : isListeningCandidate
                  ? "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 75%)"
                  : "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
                transition: "all 0.5s ease",
                animation: isSpeakingAI ? "pulseAura 1.4s infinite alternate" : "none"
              }}
            />

            {/* Stylized Vector AI Interviewer Character */}
            <div
              className={`ai-character-figure ${isListeningCandidate ? "avatar-attentive-nod" : "avatar-breathing"}`}
              style={{
                position: "relative",
                width: "140px",
                height: "175px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              {/* Audio Wave Arcs around Head when speaking */}
              {isSpeakingAI && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: "2px solid rgba(129, 140, 248, 0.4)",
                    animation: "soundWaveExpand 1.5s infinite"
                  }}
                />
              )}

              {/* Head + Face */}
              <div
                style={{
                  position: "relative",
                  width: "74px",
                  height: "82px",
                  borderRadius: "38px 38px 34px 34px",
                  background: config.skinTone,
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.35)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: 2
                }}
              >
                {/* Hair */}
                <div
                  style={{
                    position: "absolute",
                    top: "-4px",
                    width: "78px",
                    height: "36px",
                    background: config.hairColor,
                    borderRadius: "38px 38px 10px 10px"
                  }}
                />

                {/* Eyebrows */}
                <div style={{ display: "flex", gap: "18px", marginTop: "25px", zIndex: 3 }}>
                  <div
                    style={{
                      width: "14px",
                      height: "3px",
                      background: config.hairColor,
                      borderRadius: "2px",
                      transform: isSpeakingAI ? "rotate(4deg)" : "none",
                      transition: "transform 0.3s ease"
                    }}
                  />
                  <div
                    style={{
                      width: "14px",
                      height: "3px",
                      background: config.hairColor,
                      borderRadius: "2px",
                      transform: isSpeakingAI ? "rotate(-4deg)" : "none",
                      transition: "transform 0.3s ease"
                    }}
                  />
                </div>

                {/* Eyes */}
                <div style={{ display: "flex", gap: "16px", marginTop: "6px", zIndex: 3 }}>
                  {/* Left Eye */}
                  <div
                    style={{
                      width: "12px",
                      height: isBlinking ? "2px" : "10px",
                      borderRadius: isBlinking ? "1px" : "50%",
                      background: isBlinking ? config.hairColor : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.08s ease",
                      overflow: "hidden"
                    }}
                  >
                    {!isBlinking && (
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#1e293b",
                          position: "relative"
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "1px",
                            left: "1px",
                            width: "2px",
                            height: "2px",
                            borderRadius: "50%",
                            background: "#ffffff"
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Eye */}
                  <div
                    style={{
                      width: "12px",
                      height: isBlinking ? "2px" : "10px",
                      borderRadius: isBlinking ? "1px" : "50%",
                      background: isBlinking ? config.hairColor : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.08s ease",
                      overflow: "hidden"
                    }}
                  >
                    {!isBlinking && (
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#1e293b",
                          position: "relative"
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "1px",
                            left: "1px",
                            width: "2px",
                            height: "2px",
                            borderRadius: "50%",
                            background: "#ffffff"
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Glasses (if persona has glasses) */}
                {config.hasGlasses && (
                  <div
                    style={{
                      position: "absolute",
                      top: "29px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      zIndex: 4
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "14px",
                        border: "1.5px solid #38bdf8",
                        borderRadius: "3px",
                        background: "rgba(56, 189, 248, 0.08)"
                      }}
                    />
                    <div style={{ width: "8px", height: "1.5px", background: "#38bdf8" }} />
                    <div
                      style={{
                        width: "18px",
                        height: "14px",
                        border: "1.5px solid #38bdf8",
                        borderRadius: "3px",
                        background: "rgba(56, 189, 248, 0.08)"
                      }}
                    />
                  </div>
                )}

                {/* Nose */}
                <div
                  style={{
                    width: "4px",
                    height: "6px",
                    background: "rgba(0,0,0,0.12)",
                    borderRadius: "2px",
                    marginTop: "5px"
                  }}
                />

                {/* Animated Articulating Mouth */}
                <div style={{ marginTop: "7px", zIndex: 3 }}>
                  {isSpeakingAI ? (
                    <div
                      className="ai-speaking-mouth"
                      style={{
                        width: "14px",
                        height: "9px",
                        borderRadius: "50%",
                        background: "#991b1b",
                        border: "1.5px solid #7f1d1d"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "12px",
                        height: "3px",
                        borderRadius: "2px",
                        background: "#b91c1c",
                        opacity: 0.8
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Neck */}
              <div
                style={{
                  width: "22px",
                  height: "16px",
                  background: config.skinTone,
                  zIndex: 1,
                  marginTop: "-4px"
                }}
              />

              {/* Shoulders & Suit Jacket */}
              <div
                style={{
                  position: "relative",
                  width: "130px",
                  height: "56px",
                  background: config.suitColor,
                  borderRadius: "24px 24px 0 0",
                  display: "flex",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  zIndex: 2
                }}
              >
                {/* Shirt Collar / V-Neck */}
                <div
                  style={{
                    width: "26px",
                    height: "24px",
                    background: config.shirtColor,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    marginTop: "-1px"
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Persona Badge, Equalizer & Voice Quick Controls */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "12px",
          right: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10, 14, 23, 0.88)",
          backdropFilter: "blur(10px)",
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-subtle)",
          zIndex: 10
        }}
      >
        {/* Persona Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${config.accentColor}, #4f46e5)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Bot size={13} color="#ffffff" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>
              {config.name}
            </span>
            <span style={{ fontSize: "0.68rem", color: "var(--text-dim)", lineHeight: 1.1 }}>
              {config.role}
            </span>
          </div>
        </div>

        {/* Live Audio Spectrum Equalizer (12 Dynamic Bars) */}
        <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "16px" }}>
          {[0.3, 0.6, 0.9, 0.4, 0.8, 1.0, 0.7, 0.5, 0.85, 0.45, 0.75, 0.35].map((multiplier, i) => {
            let heightPct = 15;
            if (isSpeakingAI) {
              heightPct = 25 + multiplier * 70;
            } else if (isListeningCandidate) {
              heightPct = Math.min(100, 15 + audioLevel * multiplier * 110);
            }

            return (
              <span
                key={i}
                style={{
                  width: "3px",
                  height: `${heightPct}%`,
                  borderRadius: "2px",
                  background: isSpeakingAI
                    ? `linear-gradient(180deg, #a5b4fc, #6366f1)`
                    : isListeningCandidate
                    ? `linear-gradient(180deg, #6ee7b7, #10b981)`
                    : "rgba(255, 255, 255, 0.15)",
                  transition: "height 0.12s ease",
                  transformOrigin: "bottom"
                }}
              />
            );
          })}
        </div>

        {/* Replay Audio Trigger */}
        <button
          onClick={onReplayAudio}
          className="btn btn-secondary"
          style={{
            padding: "4px 10px",
            fontSize: "0.74rem",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            borderRadius: "var(--radius-full)",
            background: "rgba(255, 255, 255, 0.05)"
          }}
          title="Replay Question Audio"
        >
          <Volume2 size={12} />
          <span>Replay</span>
        </button>
      </div>
    </div>
  );
}
