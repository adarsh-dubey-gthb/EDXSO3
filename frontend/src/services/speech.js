// Enhanced Voice AI: Web Speech Synthesis, Resilient Speech Recognition, Audio Meter & Server-Side Fallback

const FILLER_LIST = ["um", "uh", "like", "you know", "basically", "actually", "literally", "sort of", "kind of"];

export class VoiceManager {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.shouldBeListening = false;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.voices = [];
    this.resumeTimer = null;
    
    // Audio recording & visualizer stream
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioContext = null;
    this.analyser = null;

    // Transcript accumulation
    this.accumulatedText = "";
    this.currentInterim = "";

    this.initRecognition();
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    this.loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    try {
      this.voices = this.synth.getVoices() || [];
    } catch (e) {
      this.voices = [];
    }
    return this.voices;
  }

  warmup() {
    if (!this.synth) return;
    try {
      if (this.synth.paused) {
        this.synth.resume();
      }
      const silent = new SpeechSynthesisUtterance(" ");
      silent.volume = 0.01;
      silent.rate = 10;
      this.synth.speak(silent);
    } catch (e) {
      console.warn("TTS warmup note:", e);
    }
  }

  initRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
      this.recognition.maxAlternatives = 1;
    }
  }

  speak(text, onStart, onEnd, onError, persona = "Professional & Rigorous") {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel prior speech and unpause stuck queue
    try {
      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.cancel();
    } catch (e) {}

    if (this.resumeTimer) {
      clearInterval(this.resumeTimer);
      this.resumeTimer = null;
    }

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance; // Retain reference to prevent V8 garbage collection mid-speech

    // Persona-based voice modulation
    if (persona === "Supportive Coach") {
      utterance.rate = 0.96;
      utterance.pitch = 1.05;
    } else if (persona === "Strict Tech Lead") {
      utterance.rate = 1.04;
      utterance.pitch = 0.94;
    } else {
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    }

    const voices = this.voices.length ? this.voices : this.loadVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith("en") && (
        v.name.includes("Natural") || 
        v.name.includes("Google") || 
        v.name.includes("Jenny") || 
        v.name.includes("Guy") || 
        v.name.includes("Samantha") || 
        v.name.includes("Daniel") || 
        v.name.includes("Arthur")
      )
    ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.resumeTimer) clearInterval(this.resumeTimer);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error event:", e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.resumeTimer) clearInterval(this.resumeTimer);
      if (onError) onError(e);
      else if (onEnd) onEnd();
    };

    // Chromium speech timeout bug workaround: resume if paused mid-speech
    this.resumeTimer = setInterval(() => {
      if (!this.isSpeaking) {
        clearInterval(this.resumeTimer);
      } else if (this.synth.paused) {
        this.synth.resume();
      }
    }, 4000);

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis speak exception:", err);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onError) onError(err);
      else if (onEnd) onEnd();
    }
  }

  stopSpeaking() {
    if (this.synth) {
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.cancel();
      } catch (e) {}
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.resumeTimer) clearInterval(this.resumeTimer);
    }
  }

  async startListening({ initialText = "", onTranscriptUpdate, onSignalUpdate, onAudioLevel, onError }) {
    this.stopSpeaking();
    this.shouldBeListening = true;
    this.accumulatedText = initialText.trim();
    this.currentInterim = "";
    this.audioChunks = [];
    const startTime = Date.now();

    // 1. Initialize Microphone Audio Stream for MediaRecorder and Volume Meter
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // MediaRecorder setup for high-accuracy fallback
        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
        this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: mime });
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };
        this.mediaRecorder.start(250); // collect chunk every 250ms

        // AudioContext for live volume meter
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(this.mediaStream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;
          source.connect(this.analyser);

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!this.shouldBeListening) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            if (onAudioLevel) onAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            requestAnimationFrame(checkVolume);
          };
          requestAnimationFrame(checkVolume);
        }
      }
    } catch (err) {
      console.warn("Microphone stream note:", err.message);
    }

    // 2. Web Speech Recognition setup with auto-reconnect on pauses
    if (this.recognition) {
      this.recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.accumulatedText = (this.accumulatedText ? this.accumulatedText + " " : "") + piece.trim();
          } else {
            interim += piece;
          }
        }
        this.currentInterim = interim;

        const fullCurrentText = (this.accumulatedText + " " + this.currentInterim).trim();
        if (onTranscriptUpdate) {
          onTranscriptUpdate(fullCurrentText);
        }

        // Live telemetry
        const durationSeconds = Math.max(1, (Date.now() - startTime) / 1000);
        const words = fullCurrentText.match(/\b[\w']+\b/g) || [];
        const wordCount = words.length;
        const wpm = Math.round((wordCount / durationSeconds) * 60);

        const lower = fullCurrentText.toLowerCase();
        const fillersFound = {};
        let totalFillers = 0;
        FILLER_LIST.forEach(f => {
          const regex = new RegExp(`\\b${f}\\b`, "g");
          const count = (lower.match(regex) || []).length;
          if (count > 0) {
            fillersFound[f] = count;
            totalFillers += count;
          }
        });

        if (onSignalUpdate) {
          onSignalUpdate({
            wpm,
            wordCount,
            durationSeconds: Math.round(durationSeconds),
            fillerCount: totalFillers,
            fillersFound
          });
        }
      };

      this.recognition.onerror = (e) => {
        if (e.error === "no-speech" || e.error === "audio-capture") {
          // Normal pause; will auto-restart in onend
          return;
        }
        console.warn("Speech recognition notice:", e.error);
        if (onError && e.error !== "aborted") onError(e);
      };

      this.recognition.onend = () => {
        // Critical fix: If the browser paused because candidate paused, automatically restart
        if (this.shouldBeListening) {
          try {
            this.recognition.start();
            this.isListening = true;
          } catch (e) {}
        } else {
          this.isListening = false;
        }
      };

      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        console.warn("SpeechRecognition start notice:", e);
      }
    } else {
      if (onError) onError(new Error("Web Speech Recognition not supported in this browser."));
    }
  }

  async stopListening() {
    this.shouldBeListening = false;
    this.isListening = false;

    // Stop speech recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    // Stop audio context
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch (e) {}
    }

    // Stop MediaRecorder and return recorded audio blob
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: "audio/webm" });
          if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
          }
          resolve(blob);
        };
        try {
          this.mediaRecorder.stop();
        } catch (e) {
          resolve(null);
        }
      } else {
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach(track => track.stop());
        }
        resolve(null);
      }
    });
  }
}

export const voiceManager = new VoiceManager();
