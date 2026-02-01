import React, { useState, useEffect, useRef } from "react";
// Page overview: Manages mic/audio graph, starts/stops Vapi voice session,
// accumulates a transcript, and sends it to backend for feedback.
// Comments call out tricky lifecycle/locking/error-handling points.
import { Mic, Square, Loader2, Signal, AlertTriangle, XCircle, Timer } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axios"; 

// Global Vapi Instance


const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resumeText } = location.state || { resumeText: "" };

  const vapiRef = useRef(null);

  if (!vapiRef.current) {
    vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);
  }
  const vapi = vapiRef.current;

  const [aiText, setAiText] = useState("Initializing AI...");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);
  const [isMicReady, setIsMicReady] = useState(false);
  
  const [errorDetails, setErrorDetails] = useState(null); 
  const [volume, setVolume] = useState(0);
  
  // Refs
  // Holds the rolling transcript across renders; avoids state re-renders
  const transcriptRef = useRef([]); 
  // WebAudio context can be 'suspended' until a user gesture; resume before streaming
  const audioContextRef = useRef(null);
  // Analyser node for mic volume visualization
  const analyserRef = useRef(null);
  // rAF id so we can stop the visualization loop cleanly
  const animationFrameRef = useRef(null);
  // Active mic stream reference; cleaned up on unmount
  const streamRef = useRef(null);
  
  // --- LOCK: Prevents double saving ---
  // HARD LOCK: prevents duplicate saves in strict mode or double-clicks
  const saveLockRef = useRef(false);

  useEffect(() => {
    const initMicOnLoad = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setIsMicReady(true);
        setupAudioProcessing(stream);
      } catch (err) {
        console.warn("Mic access blocked:", err);
        setIsMicReady(false);
        setErrorDetails("Microphone access denied. Please allow permissions.");
      }
    };
    initMicOnLoad();

    // Strict-mode safe: remove all prior listeners before adding new ones
    vapi.removeAllListeners();

    // --- VAPI EVENT LISTENERS ---

    vapi.on("call-start", () => {
        setIsSessionActive(true);
        setAiText("Hello! I've read your resume. Shall we begin?");
        setErrorDetails(null);
        // Reset lock only on fresh start
        saveLockRef.current = false;
    });

    vapi.on("error", (e) => {
        console.error("Vapi Error:", e);
        setIsSessionActive(false);
        setIsConnecting(false);
        
        // Safe error handling
        let msg = "Connection Failed.";
        if (typeof e === 'string') msg = e;
        else if (e.error?.message) msg = e.error.message;
        else if (e.message) msg = e.message;
        
        setErrorDetails(msg);
    });

    // Stream in partial/final transcripts and append to our rolling log
    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.role === "assistant") {
        setAiText(message.transcript);
      }
      
      if (message.type === "transcript" && message.transcriptType === "final") {
        transcriptRef.current.push({
          role: message.role,
          content: message.transcript
        });
      }
      
      if (message.functionCall && message.functionCall.name === "endInterview") {
        vapi.stop();
      }
    });

    // --- FIX: ONE SINGLE TRIGGER FOR SAVING ---
    // Single source of truth for finishing/saving a session
    vapi.on("call-end", () => {
      console.log("Call End Event Detected.");
      setIsSessionActive(false);
      setVolume(0); 
      handleEndSession(); 
    });

    return () => {
      vapi.stop();
      stopVolumeAnalysis(); 
      vapi.removeAllListeners(); // Cleanup on unmount
    };
  }, []);

  // Build a minimal audio graph to compute an approximate mic volume
  const setupAudioProcessing = (stream) => {
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (!analyserRef.current) {
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256; 
        }
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;
            setVolume(Math.min((average / 40), 1)); 
            animationFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
    } catch (e) {
        console.error("Audio Context Setup Error:", e);
    }
  };

  const stopVolumeAnalysis = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // Start the Vapi session after ensuring AudioContext is active
  const handleStart = async () => {
    if (!resumeText) {
      setErrorDetails("No resume found. Please go back and upload a PDF.");
      return;
    }
    setIsConnecting(true);
    setErrorDetails(null);
    transcriptRef.current = []; 
    
    // Chrome/Autoplay policy: must resume AudioContext after a gesture
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }

    try {
      // Configure model prompt + function, and pick a voice provider
      await vapi.start({
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a technical interviewer. Resume Context: "${resumeText.slice(0, 800)}". Ask ONE concise technical question at a time. Validate the answer briefly, then ask the next. After 4 questions, say "Thank you" and call 'endInterview'.`
            }
          ],
          functions: [
            {
              name: "endInterview",
              description: "Ends the interview session.",
              parameters: { type: "object", properties: {} }
            }
          ]
        },
        voice: { provider: "11labs", voiceId: "burt" }
      });
    } catch (e) {
      console.error("Vapi Start Failed:", e);
      setErrorDetails("Failed to start AI session.");
      setIsConnecting(false);
    }
  };

  // --- HARD LOCK SAVE FUNCTION ---
  const handleEndSession = async () => {
    // 1. Check Lock immediately
    if (saveLockRef.current) {
        console.warn("Duplicate save prevented by Lock.");
        return;
    }
    // 2. Set Lock immediately
    saveLockRef.current = true;

    if (transcriptRef.current.length === 0) {
      console.warn("No transcript. Skipping save.");
      saveLockRef.current = false; // Reset lock if we didn't actually save
      return; 
    }

    setIsProcessingFeedback(true);
    setErrorDetails(null);

    try {
      console.log("Sending transcript to backend...");
      
      const response = await api.post("/interview/end", {
        transcript: transcriptRef.current,
        resumeText: resumeText
      });

      navigate("/feedback", { 
        state: { feedback: response.data.data.feedback } 
      });

    } catch (error) {
      console.error("Error generating feedback:", error);
      
      let errorMessage = "Error generating feedback.";
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.message) errorMessage = error.message;
      
      // Ensure error is string
      if (typeof errorMessage === 'object') errorMessage = JSON.stringify(errorMessage);
      
      setErrorDetails(errorMessage);
      setIsProcessingFeedback(false);
      
      // ONLY release lock on error, so user can retry. 
      // On success, we navigate away, so lock stays true to prevent double-clicks during transition.
      saveLockRef.current = false; 
    } 
  };

  const getMicStatusText = () => {
    if (isSessionActive) return volume > 0.05 ? "User Speaking..." : "Listening...";
    return isMicReady ? "Mic Ready" : "Mic Inactive";
  };

  return (
    <div className="flex flex-col items-center h-full px-4 pt-4 pb-2 md:py-8 overflow-hidden font-sans relative">
      
      {/* ERROR MODAL */}
      {errorDetails && (
        <div className="absolute top-20 z-50 w-full max-w-lg bg-red-950/90 border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl flex items-start gap-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-5">
            <AlertTriangle className="shrink-0 text-red-500" size={24} />
            <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Session Error</h3>
                <p className="text-sm leading-relaxed">{String(errorDetails)}</p>
            </div>
            <button onClick={() => setErrorDetails(null)} className="text-red-400 hover:text-white">
                <XCircle size={20} />
            </button>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {isProcessingFeedback && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500 text-center px-4">
           <div className="relative">
             <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
             <Loader2 className="w-20 h-20 text-cyan-400 animate-spin relative z-10" />
           </div>
           <h2 className="text-3xl font-black text-white mt-8 tracking-tight">Generating Feedback</h2>
           <div className="mt-4 space-y-2 text-slate-400 text-sm max-w-md">
             <p>Analysing your responses...</p>
             <p>Calculating technical score...</p>
             <p className="text-xs text-slate-500 italic mt-4">(This may take 10-20 seconds)</p>
           </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-4 md:mb-6 text-center z-10">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">AI Technical Interview</h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${isSessionActive ? "bg-green-500 animate-pulse" : "bg-slate-600"}`}></div>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest">
            {isSessionActive ? "Live Session" : "Ready to Start"}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl flex-[0.85] min-h-0 overflow-hidden mb-6 z-10">
        <div className="flex-[1.2] flex flex-col bg-black/40 backdrop-blur-sm border border-blue-900/40 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden min-h-[280px] md:min-h-0 relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Interviewer</span>
          </div>
          <div className="flex-1 overflow-y-auto text-sm md:text-lg font-medium leading-relaxed text-slate-200 pr-2 scrollbar-thin scrollbar-thumb-blue-900/50">
            {aiText}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-end md:justify-center bg-black/40 backdrop-blur-sm border border-blue-900/40 rounded-3xl p-6 pb-16 md:pb-8 md:p-8 shadow-2xl relative overflow-hidden min-h-[280px] md:min-h-0">
          <div className="relative flex items-center justify-center scale-100 md:scale-110">
            <div className={`absolute rounded-full border border-cyan-500/30 transition-all duration-75`} style={{ width: `${160 + (volume * 100)}px`, height: `${160 + (volume * 100)}px`, opacity: volume > 0.05 ? 0.6 : 0 }} />
            <div className="absolute rounded-full bg-cyan-500/20 transition-all duration-75 ease-out blur-xl" style={{ width: '120px', height: '120px', transform: `scale(${1 + (volume * 3)})`, opacity: 0.2 + volume }} />
            <div className={`relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isSessionActive ? 'bg-blue-900/20 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.15)]' : 'bg-slate-900/50 border-slate-800'}`}>
              {isSessionActive ? <Mic className="w-10 h-10 md:w-14 md:h-14 text-white" /> : <Signal className={`w-10 h-10 md:w-14 md:h-14 ${isMicReady ? 'text-cyan-400' : 'text-slate-600'}`} />}
            </div>
          </div>
          <p className="absolute bottom-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            {getMicStatusText()}
            {isSessionActive && <Timer size={10} className="text-cyan-500 animate-spin-slow" />}
          </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex-none pb-6 md:pb-8 flex items-center justify-center w-full z-10">
        {!isSessionActive ? (
          <button 
            onClick={handleStart}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-full font-bold text-sm md:text-lg transition-all transform hover:scale-105 flex items-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
            {isConnecting ? "CONNECTING..." : "START INTERVIEW"}
          </button>
        ) : (
          <button 
            onClick={() => vapi.stop()} 
            disabled={isProcessingFeedback} 
            className="flex items-center gap-3 bg-red-500/10 hover:bg-red-500 border border-red-500 text-red-500 hover:text-white px-12 py-4 rounded-full font-bold text-sm md:text-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50"
          >
            <Square size={16} className="fill-current" />
            {isProcessingFeedback ? "SAVING..." : "END SESSION"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Interview;