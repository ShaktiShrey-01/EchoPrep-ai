import React, { useRef, useState } from "react";
import { Upload, ScanLine, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios"; // <--- Import your axios instance
import img_home from "../src/assets/img_home.png"; // Ensure this path is correct

const Home = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  // Trigger hidden file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle File Selection & Upload
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate PDF
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Create FormData
      const formData = new FormData();
      formData.append("resume", file);

      // 2. Send to Backend (Fixing the logic here)
      const response = await api.post('/resume/upload', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // 3. Extract the text from the response
      const { resumeText } = response.data.data;
      
      console.log("File uploaded & Parsed:", file.name);
      
      // 4. Redirect to interview page WITH the resume text
      navigate("/interview", { state: { resumeText } });

    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to parse resume. Please ensure it is a valid PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Reduced max-width from 6xl to 4xl (~30% smaller container) */}
      <div className="w-full max-w-4xl mx-auto p-4 mt-4 md:mt-8 flex flex-col md:flex-row gap-5 font-sans">
        
        {/* ==================== CARD 1: Interview Prep ==================== */}
        <div className="flex-1 relative group rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950 shadow-xl">
          
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-slate-950 z-0"></div>
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/30 to-blue-600/10 rounded-2xl blur-md z-[-1] opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex flex-col h-full">
            
            <div className="pt-4 px-4">
                <div className="w-full h-28 md:h-36 overflow-hidden rounded-xl border border-cyan-500/30">
                  <img 
                    src={img_home} 
                    alt="AI Interview" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                </div>
            </div>

            <div className="p-4 md:p-5 flex flex-col flex-grow items-center text-center">
              
              <div className="w-full mb-5">
                <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wide leading-relaxed w-full border-b border-dashed border-cyan-500/30 pb-3">
                  Get Interview Ready <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    With AI Practice
                  </span>
                </h2>
                <p className="text-slate-400 text-xs mt-2 w-full">
                  Master your responses with real-time feedback.
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-auto w-full flex justify-center">
                {/* Hidden Input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf" 
                  className="hidden"
                />

                <button 
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="group/btn relative inline-flex w-auto items-center justify-center overflow-hidden rounded-lg p-[1px] font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#083344_0%,#06b6d4_50%,#083344_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950/90 px-6 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-3xl gap-2 z-10 transition-all group-hover/btn:bg-slate-900 border border-cyan-500/20 hover:text-cyan-400">
                    {isUploading ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin mr-2" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-3 h-3 mr-2" />
                            Upload Resume
                        </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CARD 2: ATS Scanner ==================== */}
        <div className="flex-1 relative group rounded-2xl overflow-hidden border border-purple-500/20 bg-slate-950 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-slate-950 z-0"></div>
          <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/30 to-pink-600/10 rounded-2xl blur-md z-[-1] opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="pt-4 px-4">
                <div className="w-full h-28 md:h-36 overflow-hidden rounded-xl border border-purple-500/30">
                  <img 
                    src="https://substackcdn.com/image/fetch/w_520,h_272,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https://substack-post-media.s3.amazonaws.com/public/images/1138e6da-8e64-470a-ae30-e1177507e18b_1472x832.jpeg" 
                    alt="ATS Analysis" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                </div>
            </div>

            <div className="p-4 md:p-5 flex flex-col flex-grow items-center text-center">
              <div className="w-full mb-5">
                <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wide leading-relaxed w-full border-b border-dashed border-purple-500/30 pb-3">
                  Check ATS Score <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    For Your Resume
                  </span>
                </h2>
                <p className="text-slate-400 text-xs mt-2 w-full">
                  Scan your CV against industry standards.
                </p>
              </div>

              {/* Action Button: ATS Navigation */}
              <div className="mt-auto w-full flex justify-center">
                <button 
                    onClick={() => navigate("/ats")}
                    className="group/btn relative inline-flex w-auto items-center justify-center overflow-hidden rounded-lg p-[1px] font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#2e1065_0%,#c026d3_50%,#2e1065_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950/90 px-6 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-3xl gap-2 z-10 transition-all group-hover/btn:bg-slate-900 border border-purple-500/20 hover:text-purple-400">
                    <ScanLine className="w-3 h-3 mr-2" />
                    Check ATS Score
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Home;