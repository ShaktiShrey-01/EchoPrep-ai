import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, ArrowRight, Home, Loader2, Copy } from "lucide-react";
import api from "../utils/axios"; // Ensure you have your axios instance

const Feedback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Get state from navigation (might be full data OR just an ID)
  const { feedback: passedFeedback, interviewId } = location.state || {};

  const [feedback, setFeedback] = useState(passedFeedback || null);
  const [loading, setLoading] = useState(!passedFeedback); // If no data yet, we are loading
  const [error, setError] = useState(null);

  // --- FETCH DATA IF MISSING ---
  useEffect(() => {
    // If we already have data (from finishing an interview just now), do nothing.
    if (passedFeedback) {
        setLoading(false);
        return;
    }

    // If we have an ID (from Profile), fetch the details
    if (interviewId) {
        const fetchInterviewDetails = async () => {
            try {
                setLoading(true);
                // Calls: GET /api/v1/interview/:id
                const response = await api.get(`/interview/${interviewId}`);
                
                // The backend returns the full interview object
                // We typically store the 'feedback' part in state
                const interviewData = response.data.data;
                
                if (interviewData && interviewData.feedback) {
                    setFeedback(interviewData.feedback);
                } else {
                    setError("No feedback generated for this interview yet.");
                }

            } catch (err) {
                console.error("Error fetching feedback:", err);
                setError("Failed to load interview details.");
            } finally {
                setLoading(false);
            }
        };

        fetchInterviewDetails();
    } else {
        // No ID and no Data? Invalid access.
        setLoading(false);
        setError("No interview data found. Please take an interview first.");
    }
  }, [interviewId, passedFeedback]);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-cyan-500 gap-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Retrieving analysis...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full bg-red-950/20 border border-red-500/30 p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Feedback</h2>
            <p className="text-red-200 mb-6">{error || "Data unavailable"}</p>
            <button 
                onClick={() => navigate("/")}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-semibold transition"
            >
                Return Home
            </button>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                    AI Feedback <span className="text-cyan-400">Report</span>
                </h1>
                <p className="text-slate-400 mt-1">Detailed analysis of your performance.</p>
            </div>
            <button 
                onClick={() => navigate("/")} // Or "/" depending on your routes
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-all"
            >
                <Home size={18} /> Home
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COL: SCORES */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Overall Score Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-4">Overall Score</p>
                        <div className={`text-8xl font-black ${getScoreColor(feedback.overallScore)} mb-2`}>
                            {feedback.overallScore}
                        </div>
                        <p className="text-slate-500 text-sm">OUT OF 100</p>
                    </div>
                    {/* Progress Bar Bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-800">
                        <div 
                           className={`h-full ${getProgressColor(feedback.overallScore)} transition-all duration-1000`} 
                           style={{ width: `${feedback.overallScore}%` }}
                        ></div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <h3 className="flex items-center gap-2 text-white font-bold mb-6">
                        <Loader2 className="text-cyan-400" size={20} /> Score Breakdown
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300">Technical Knowledge</span>
                                <span className="text-white font-bold">{feedback.technicalScore}/100</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500" style={{ width: `${feedback.technicalScore}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300">Communication Skills</span>
                                <span className="text-white font-bold">{feedback.communicationScore}/100</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: `${feedback.communicationScore}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COL: ANALYSIS */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Summary */}
                <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/50 border border-blue-500/20 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        ⚡ Executive Summary
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-lg">
                        {feedback.summary || feedback.comments || "No summary available."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-slate-900/50 border border-emerald-500/20 rounded-3xl p-6">
                        <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                            <CheckCircle size={20} /> Strengths
                        </h3>
                        <ul className="space-y-3">
                            {feedback.strengths?.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Improvements */}
                    <div className="bg-slate-900/50 border border-red-500/20 rounded-3xl p-6">
                        <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                            <AlertCircle size={20} /> Areas for Growth
                        </h3>
                        <ul className="space-y-3">
                            {feedback.improvements?.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Action Items */}
                <div className="bg-slate-900/50 border border-blue-900/50 rounded-3xl p-8">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <ArrowRight size={16} /> Recommended Actions
                    </h3>
                    <div className="space-y-3">
                         {feedback.actions?.map((action, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                                <span className="w-8 h-8 flex items-center justify-center bg-blue-500/20 text-blue-400 font-bold rounded-lg text-sm">
                                    {i + 1}
                                </span>
                                <p className="text-slate-300 text-sm font-medium">{action}</p>
                            </div>
                         ))}
                         {!feedback.actions?.length && (
                             <p className="text-slate-500 text-sm italic">No specific actions generated.</p>
                         )}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;