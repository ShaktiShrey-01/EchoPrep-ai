import React, { useState, useRef } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle2, XCircle, ScanLine, Search, Loader2, ArrowRight } from "lucide-react";
import api from "../utils/axios"; 

const Ats = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        return;
    }

    setIsScanning(true);
    setResult(null);

    try {
        const formData = new FormData();
        formData.append("resume", file);

        const response = await api.post("/resume/ats-check", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        const data = response.data.data;
        
        setResult({
            score: data.score,
            status: data.status,
            message: data.message,
            issues: data.issues || []
        });

    } catch (error) {
        console.error("ATS Scan Failed:", error);
        alert("Failed to scan resume. Please try again.");
    } finally {
        setIsScanning(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500";
    if (score >= 60) return "text-yellow-400 border-yellow-500";
    return "text-red-400 border-red-500";
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 font-sans min-h-screen">
        
        {/* HEADER */}
        <div className="text-center mb-10">
           <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
             ATS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Scanner</span>
           </h1>
           <p className="text-slate-400 mt-2 text-sm md:text-base">
             Check your resume score against AI filtering algorithms.
           </p>
        </div>

        {/* ================= CARD 1: UPLOAD / SCANNER ================= */}
        <div className="relative w-full h-80 rounded-3xl overflow-hidden bg-slate-950 border border-purple-500/20 shadow-2xl mb-8 transition-all duration-500">
           
           <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-slate-950 z-0"></div>

           {isScanning ? (
             <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950">
                <div className="relative w-24 h-32 border-2 border-slate-700 rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden mb-6">
                   <FileText size={40} className="text-slate-600" />
                   <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-scan"></div>
                   <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,#0f172a_2px),linear-gradient(90deg,transparent_2px,#0f172a_2px)] bg-[size:4px_4px] opacity-20"></div>
                </div>

                <h3 className="text-purple-400 font-bold text-lg animate-pulse tracking-widest uppercase">Scanning Resume...</h3>
                <p className="text-slate-500 text-xs mt-2 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Deep analysis in progress...
                </p>
             </div>
           ) : (
             <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-purple-400 mb-6 shadow-lg shadow-purple-500/10">
                   <Search size={32} />
                </div>
                
                <h2 className="text-xl font-bold text-white mb-2">Upload Your Resume</h2>
                <p className="text-slate-400 text-sm mb-8 max-w-sm">
                   Upload your PDF file to identify parsing errors, formatting issues, and keyword gaps.
                </p>

                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />

                <button 
                  onClick={triggerUpload}
                  className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-purple-600 font-lg rounded-xl hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] focus:outline-none ring-offset-2 focus:ring-2 ring-purple-400"
                >
                  <Upload className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
                  Analyze Resume
                </button>
             </div>
           )}
        </div>

        {/* ================= CARD 2: RESULT ================= */}
        {result && (
          <div className="animate-fade-in-up w-full rounded-3xl bg-slate-900/50 border border-slate-800 p-6 md:p-8 backdrop-blur-sm">
              
              {/* Header Score Row */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
                <div>
                   <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">ATS Compatibility Score</h3>
                   <div className={`text-6xl font-black ${getScoreColor(result.score).split(' ')[0]}`}>
                      {result.score}/100
                   </div>
                </div>
                
                <div className={`px-6 py-3 rounded-xl border bg-opacity-10 ${getScoreColor(result.score).replace('text-', 'bg-').replace('border-', 'border-')} ${getScoreColor(result.score)}`}>
                   <span className="font-bold uppercase tracking-wide text-lg">{result.status}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-8 p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h4 className="text-white font-bold mb-2">Analysis Summary</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{result.message}</p>
              </div>

              {/* Issues Grid */}
              <div>
                {result.issues.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                         <CheckCircle2 size={32} className="text-emerald-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg">Perfect Score!</h4>
                      <p className="text-slate-400 text-sm mt-2">Your resume is fully optimized.</p>
                  </div>
                ) : (
                  <div>
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                         <AlertTriangle className="text-red-400" size={20} />
                         Detailed Feedback Points ({result.issues.length})
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-3">
                         {result.issues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-red-500/30 transition-colors">
                               <div className="mt-1 w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                   <span className="text-red-400 text-xs font-bold">{index + 1}</span>
                               </div>
                               <p className="text-slate-300 text-sm leading-relaxed">{issue}</p>
                            </div>
                         ))}
                      </div>

                      <div className="mt-8 flex items-center justify-center">
                          <p className="text-slate-500 text-xs italic flex items-center gap-2">
                             <ScanLine size={14} /> AI Analysis powered by Gemini
                          </p>
                      </div>
                  </div>
                )}
              </div>

          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Ats;