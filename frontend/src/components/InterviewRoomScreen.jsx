import React, { useState, useEffect, useRef } from "react";
import {
  Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Sparkles,
  Play, Square, Send, AlertCircle, CheckCircle2, ChevronRight,
  TrendingUp, Award, Clock, ArrowRight, RefreshCw, Bot, User, Gauge
} from "lucide-react";
import { voiceManager } from "../services/speech";
import { submitInterviewAnswer, finishInterviewSession, transcribeAudioFile } from "../services/api";

export default function InterviewRoomScreen({
  sessionInfo,
  roleData,
  candidateData,
  onFinishInterview,
  provider,
  persona = "Professional & Rigorous"
}) {
  const [currentLevel, setCurrentLevel] = useState(sessionInfo?.current_level || 1);
  const [levelName, setLevelName] = useState(sessionInfo?.level_name || "Level 1 — Screening Interview");
  const [currentQuestion, setCurrentQuestion] = useState(sessionInfo?.question || "");
  const [turnIndex, setTurnIndex] = useState(sessionInfo?.turn_index || 0);
  const [isCounterQuestion, setIsCounterQuestion] = useState(false);
  const [difficultyTag, setDifficultyTag] = useState("Standard");

  // Interaction State
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [isListeningCandidate, setIsListeningCandidate] = useState(false);
  const [candidateTranscript, setCandidateTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTranscribingAI, setIsTranscribingAI] = useState(false);
  const [lastAudioBlob, setLastAudioBlob] = useState(null);

  // Live Speech Telemetry
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveDuration, setLiveDuration] = useState(0);
  const [liveFillers, setLiveFillers] = useState(0);
  const [liveFillerBreakdown, setLiveFillerBreakdown] = useState({});
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // WebCam Video Feed
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [streamError, setStreamError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Instant Feedback on last submitted turn
  const [lastTurnFeedback, setLastTurnFeedback] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([
    {
      turn_index: 0,
      level_name: sessionInfo?.level_name || "Level 1 — Screening Interview",
      question: sessionInfo?.question || "",
      answer: null
    }
  ]);

  // Initialize camera
  useEffect(() => {
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
            audio: false // audio handled separately by Web Speech to avoid echo
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn("Camera access note:", err.message);
        setStreamError("Camera preview unavailable or permission denied. You can proceed with Voice & Audio seamlessly!");
        setCameraActive(false);
      }
    }

    if (cameraActive) {
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  // Speak opening question when mounted
  useEffect(() => {
    if (sessionInfo?.question && autoSpeak) {
      playAIQuestion(sessionInfo.question);
    }
    return () => {
      voiceManager.stopSpeaking();
      voiceManager.stopListening();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const playAIQuestion = (text) => {
    setIsSpeakingAI(true);
    voiceManager.speak(
      text,
      () => setIsSpeakingAI(true),
      () => setIsSpeakingAI(false),
      () => setIsSpeakingAI(false)
    );
  };

  const handleToggleListening = async () => {
    if (isListeningCandidate) {
      // Stop listening & retrieve recorded audio
      const audioBlob = await voiceManager.stopListening();
      setIsListeningCandidate(false);
      setAudioLevel(0);
      if (timerRef.current) clearInterval(timerRef.current);

      if (audioBlob && audioBlob.size > 2000) {
        setLastAudioBlob(audioBlob);
        // If transcript was empty or brief, automatically transcribe with Gemini Audio AI
        if (candidateTranscript.trim().length < 15) {
          try {
            setIsTranscribingAI(true);
            const res = await transcribeAudioFile(audioBlob);
            if (res && res.transcript && res.transcript.trim()) {
              setCandidateTranscript(res.transcript.trim());
            }
          } catch (e) {
            console.warn("AI audio transcription note:", e);
          } finally {
            setIsTranscribingAI(false);
          }
        }
      }
    } else {
      // Start listening
      voiceManager.stopSpeaking();
      setIsSpeakingAI(false);
      setIsListeningCandidate(true);
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setLiveDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

      voiceManager.startListening({
        initialText: candidateTranscript,
        onTranscriptUpdate: (text) => {
          setCandidateTranscript(text);
        },
        onAudioLevel: (level) => {
          setAudioLevel(level);
        },
        onSignalUpdate: (signals) => {
          setLiveWpm(signals.wpm);
          setLiveFillers(signals.fillerCount);
          setLiveFillerBreakdown(signals.fillersFound);
        },
        onError: (err) => {
          console.warn("Speech recognition notice:", err.message);
        }
      });
    }
  };

  const handleTranscribeWithAI = async () => {
    if (!lastAudioBlob) return;
    setIsTranscribingAI(true);
    try {
      const res = await transcribeAudioFile(lastAudioBlob);
      if (res && res.transcript && res.transcript.trim()) {
        setCandidateTranscript(res.transcript.trim());
      }
    } catch (err) {
      alert(`AI Audio Transcription: ${err.message}`);
    } finally {
      setIsTranscribingAI(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!candidateTranscript.trim() || isSubmitting) return;

    if (isListeningCandidate) {
      await voiceManager.stopListening();
      setIsListeningCandidate(false);
      setAudioLevel(0);
    }
    if (timerRef.current) clearInterval(timerRef.current);

    setIsSubmitting(true);
    const duration = liveDuration || 10;

    try {
      const result = await submitInterviewAnswer(
        sessionInfo.session_id,
        candidateTranscript,
        liveWpm,
        duration,
        liveFillerBreakdown,
        provider
      );

      // Record in local conversation history
      setConversationHistory(prev => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[copy.length - 1].answer = candidateTranscript;
          copy[copy.length - 1].evaluation = result.last_turn_evaluation;
        }
        return copy;
      });

      setLastTurnFeedback(result.last_turn_evaluation);

      // Reset candidate input buffer
      setCandidateTranscript("");
      setLiveDuration(0);
      setLiveFillers(0);
      setLiveWpm(0);

      if (result.is_finished) {
        // Complete interview
        onFinishInterview(sessionInfo.session_id);
      } else {
        // Advance to next question
        setCurrentQuestion(result.question);
        setCurrentLevel(result.current_level);
        setLevelName(result.level_name);
        setTurnIndex(result.turn_index);
        setIsCounterQuestion(result.is_counter_question || false);
        setDifficultyTag(result.difficulty_tag || "Standard");

        // Append next question to conversation
        setConversationHistory(prev => [
          ...prev,
          {
            turn_index: result.turn_index,
            level_name: result.level_name,
            question: result.question,
            answer: null
          }
        ]);

        // Speak next question
        if (autoSpeak) {
          playAIQuestion(result.question);
        }
      }
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishEarly = async () => {
    voiceManager.stopSpeaking();
    voiceManager.stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await finishInterviewSession(sessionInfo.session_id);
    } catch (e) {}
    onFinishInterview(sessionInfo.session_id);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1440px", margin: "0 auto", padding: "24px 20px" }}>
      {/* Top Header & Level Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px",
        background: "rgba(18, 24, 38, 0.6)",
        padding: "16px 24px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span className={`badge ${currentLevel === 1 ? 'badge-primary' : currentLevel === 2 ? 'badge-cyan' : 'badge-rose'}`} style={{ fontSize: "0.88rem", padding: "6px 14px" }}>
            {levelName}
          </span>
          <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
            Turn <strong>{turnIndex + 1}</strong> of 6
          </span>
          {isCounterQuestion && (
            <span className="badge badge-amber" style={{ fontSize: "0.78rem" }}>
              ⚡ Dynamic Adaptive Counter-Question
            </span>
          )}
          <span className="badge badge-primary" style={{ fontSize: "0.76rem" }}>
            Interviewer: {persona}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setAutoSpeak(!autoSpeak)}
            style={{ fontSize: "0.82rem", padding: "6px 12px" }}
            title={autoSpeak ? "Auto-speech is enabled" : "Auto-speech is disabled"}
          >
            {autoSpeak ? <Volume2 size={15} color="#818cf8" /> : <VolumeX size={15} color="var(--text-dim)" />}
            <span>{autoSpeak ? "Voice TTS On" : "Voice TTS Off"}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleFinishEarly}
            style={{ fontSize: "0.82rem", padding: "6px 14px", color: "#fda4af", borderColor: "rgba(244, 63, 94, 0.2)" }}
          >
            Finish Early & Generate Report
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: AI Interviewer (Left) vs Candidate Camera & Response (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "24px", marginBottom: "24px" }}>
        
        {/* Left Column: AI Interviewer Interactive Screen */}
        <div className="glass-panel" style={{ padding: "26px", display: "flex", flexDirection: "column" }}>
          
          {/* AI Avatar Stage */}
          <div style={{
            background: "linear-gradient(180deg, rgba(14, 18, 27, 0.9) 0%, rgba(10, 14, 23, 0.95) 100%)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "32px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: "220px",
            marginBottom: "20px"
          }}>
            {/* Status indicator */}
            <div style={{ position: "absolute", top: "14px", left: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isSpeakingAI ? "#818cf8" : isListeningCandidate ? "#10b981" : "#64748b"
              }}></span>
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600 }}>
                {isSpeakingAI ? "AI Interviewer Speaking..." : isListeningCandidate ? "AI Listening to You..." : "Ready"}
              </span>
            </div>

            {/* AI Avatar Icon with pulsing wave */}
            <div
              className={isSpeakingAI ? "avatar-speaking" : ""}
              style={{
                width: "84px",
                height: "84px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
                transition: "all 0.3s ease"
              }}
            >
              <Bot size={44} color="#ffffff" />
            </div>

            {/* Speaking waveform visualizer */}
            {isSpeakingAI ? (
              <div className="waveform-container" style={{ margin: "6px 0" }}>
                <span className="waveform-bar"></span>
                <span className="waveform-bar"></span>
                <span className="waveform-bar"></span>
                <span className="waveform-bar"></span>
                <span className="waveform-bar"></span>
                <span className="waveform-bar"></span>
              </div>
            ) : (
              <div style={{ height: "36px", display: "flex", alignItems: "center", color: "var(--text-dim)", fontSize: "0.82rem" }}>
                <span>Interviewer Portal</span>
              </div>
            )}

            {/* Audio replay button */}
            <button
              className="btn btn-secondary"
              onClick={() => playAIQuestion(currentQuestion)}
              style={{ marginTop: "6px", fontSize: "0.78rem", padding: "4px 12px", borderRadius: "var(--radius-full)" }}
            >
              <Volume2 size={13} /> Replay Question Audio
            </button>
          </div>

          {/* Current Question Box */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase" }}>
                Current Question Prompt
              </span>
              <span className="badge badge-primary" style={{ fontSize: "0.72rem" }}>
                Adaptive Mode: {difficultyTag}
              </span>
            </div>
            
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "18px 20px",
              fontSize: "1.08rem",
              lineHeight: 1.6,
              color: "#ffffff",
              fontFamily: "var(--font-heading)",
              fontWeight: 500
            }}>
              "{currentQuestion}"
            </div>
          </div>

          {/* Turn Feedback Drawer (if available from previous question) */}
          {lastTurnFeedback && (
            <div style={{
              marginTop: "auto",
              background: "rgba(16, 185, 129, 0.07)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "#6ee7b7", fontWeight: 700 }}>
                  Immediate Turn Evaluation
                </span>
                <span className="badge badge-emerald" style={{ fontSize: "0.75rem" }}>
                  Score: {lastTurnFeedback.turn_score}/100 ({lastTurnFeedback.rating})
                </span>
              </div>
              <div style={{ fontSize: "0.84rem", color: "var(--text-main)", marginBottom: "6px" }}>
                <strong style={{ color: "#34d399" }}>Strengths:</strong> {lastTurnFeedback.what_was_good}
              </div>
              <div style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                <strong style={{ color: "#fbbf24" }}>Improvement:</strong> {lastTurnFeedback.what_could_be_better}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Candidate Video Interview & Voice Response */}
        <div className="glass-panel" style={{ padding: "26px", display: "flex", flexDirection: "column" }}>
          
          {/* Candidate Camera Stream (Bonus / Highly Preferred) */}
          <div style={{
            position: "relative",
            width: "100%",
            height: "240px",
            background: "#080c14",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
            marginBottom: "18px"
          }}>
            {cameraActive && !streamError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)" // mirror preview
                }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-dim)" }}>
                <User size={50} style={{ opacity: 0.4, marginBottom: "8px" }} />
                <span style={{ fontSize: "0.85rem" }}>Voice Mode Active (Camera Off)</span>
              </div>
            )}

            {/* Stream Error Notice */}
            {streamError && (
              <div style={{ position: "absolute", bottom: "8px", left: "10px", right: "10px", background: "rgba(0,0,0,0.7)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.72rem", color: "#fda4af" }}>
                {streamError}
              </div>
            )}

            {/* Video Overlay Camera Controls */}
            <div style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCameraActive(!cameraActive)}
                style={{ padding: "6px", borderRadius: "50%", background: "rgba(0,0,0,0.6)" }}
                title={cameraActive ? "Turn off camera" : "Turn on camera"}
              >
                {cameraActive ? <Video size={14} color="#34d399" /> : <VideoOff size={14} color="var(--text-dim)" />}
              </button>
            </div>

            {/* Live Real-time Telemetry Pill Overlay */}
            <div style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              right: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(10, 14, 23, 0.8)",
              backdropFilter: "blur(8px)",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)"
            }}>
              {/* Speaking Pace */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem" }}>
                <Gauge size={13} color="#818cf8" />
                <span>Pace: <strong>{liveWpm} WPM</strong></span>
              </div>

              {/* Filler Words */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem" }}>
                <span style={{ color: liveFillers > 3 ? "#f43f5e" : "#fbbf24", fontWeight: 700 }}>⚠️</span>
                <span>Fillers: <strong>{liveFillers}</strong></span>
              </div>

              {/* Timer */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                <Clock size={13} />
                <span>{liveDuration}s</span>
              </div>
            </div>
          </div>

          {/* Voice Input Action Controls */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase" }}>
                Candidate Spoken Transcript / Response
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {candidateTranscript && (
                  <button
                    type="button"
                    onClick={() => setCandidateTranscript("")}
                    style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Clear text
                  </button>
                )}
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  * Speak via mic or type/edit
                </span>
              </div>
            </div>

            {/* Live Active Mic Indicator with Audio Soundwave Meter */}
            {isListeningCandidate && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "8px 14px",
                marginBottom: "10px"
              }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px #10b981"
                }}></span>
                <span style={{ fontSize: "0.82rem", color: "#6ee7b7", fontWeight: 600 }}>
                  Microphone Active — Speak naturally (pauses will not cut you off)
                </span>
                
                {/* Live audio level bars */}
                <div style={{ display: "flex", alignItems: "center", gap: "3px", marginLeft: "auto", height: "18px" }}>
                  {[1, 2, 3, 4, 5, 6].map((bar) => {
                    const h = Math.max(3, Math.min(18, (audioLevel / 100) * 18 * (bar % 2 === 0 ? 1.3 : 0.8)));
                    return (
                      <span
                        key={bar}
                        style={{
                          width: "3px",
                          height: `${h}px`,
                          background: "#10b981",
                          borderRadius: "2px",
                          transition: "height 0.08s ease"
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Transcribing Notice */}
            {isTranscribingAI && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "8px 14px",
                marginBottom: "10px",
                fontSize: "0.82rem",
                color: "#a5b4fc"
              }}>
                <Sparkles size={15} color="#818cf8" />
                <span>Transcribing audio with Gemini Multimodal AI for technical precision...</span>
              </div>
            )}

            <textarea
              className="textarea-custom"
              rows={4}
              value={candidateTranscript}
              onChange={(e) => setCandidateTranscript(e.target.value)}
              placeholder="Click 'Start Speaking' or type your response here... (e.g. explain your technical architecture, trade-offs, and metrics)"
              style={{ fontSize: "0.95rem" }}
            />

            {/* Audio Refine Button if Audio was recorded */}
            {lastAudioBlob && !isListeningCandidate && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={handleTranscribeWithAI}
                  disabled={isTranscribingAI}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.78rem", padding: "4px 10px", color: "#818cf8", borderColor: "rgba(99, 102, 241, 0.3)" }}
                  title="Use Gemini Multimodal AI to transcribe technical vocabulary and numbers from your audio recording"
                >
                  <Sparkles size={13} color="#818cf8" />
                  <span>{isTranscribingAI ? "AI Transcribing..." : "Refine with Gemini Audio AI"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Big Voice Mic Button & Submit Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "auto" }}>
            <button
              className={`btn ${isListeningCandidate ? 'btn-rose' : 'btn-emerald'}`}
              onClick={handleToggleListening}
              style={{ flex: 1, padding: "14px 20px" }}
            >
              {isListeningCandidate ? (
                <>
                  <Square size={18} />
                  <span>Stop Recording Voice</span>
                </>
              ) : (
                <>
                  <Mic size={18} />
                  <span>Start Speaking (Mic)</span>
                </>
              )}
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSubmitResponse}
              disabled={!candidateTranscript.trim() || isSubmitting}
              style={{ padding: "14px 28px" }}
            >
              {isSubmitting ? (
                <span>Evaluating...</span>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Transcript Timeline Preview */}
      {conversationHistory.length > 1 && (
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px", color: "var(--text-muted)" }}>
            Live Interview Transcript Stream ({conversationHistory.length} turns)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>
            {conversationHistory.map((item, idx) => (
              <div key={idx} style={{ fontSize: "0.84rem", padding: "8px 12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                <span className="badge badge-primary" style={{ fontSize: "0.7rem", marginRight: "8px" }}>Turn {item.turn_index + 1}</span>
                <strong style={{ color: "#818cf8" }}>AI:</strong> {item.question}
                {item.answer && (
                  <div style={{ marginTop: "4px", color: "var(--text-main)", paddingLeft: "16px", borderLeft: "2px solid #10b981" }}>
                    <strong style={{ color: "#34d399" }}>You:</strong> {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
