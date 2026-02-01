import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, History, Calendar, Award, ChevronRight, Loader2, AlertCircle, User as UserIcon, Trash2 } from "lucide-react";
import api from "../utils/axios"; 

const Profile = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for delete button loader
  const [isDeleting, setIsDeleting] = useState(false); 

   // --- FETCH DATA ---
   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            
            // --- API Calls ---
            const [profileRes, interviewRes] = await Promise.all([
                 api.get("/users/me"), 
                 api.get("/interview/history")   
            ]);

            const userData = profileRes.data.data; 
            setUser({
                  name: userData.fullName || userData.username, 
                  email: userData.email,
                  avatarInitial: (userData.username?.[0] || "U").toUpperCase(),
                  joined: new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });

            setInterviews(interviewRes.data.data || []);

         } catch (err) {
            console.error("Profile Fetch Error:", err);
            setError("Failed to load profile data.");
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, []);

  // --- DELETE ACCOUNT HANDLER ---
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
        "ARE YOU SURE?\n\nThis will permanently delete your account and all your interview history.\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
        await api.delete("/users/delete-account");
        // Clear any local storage auth
        localStorage.removeItem("user"); 
        // Force redirect to home/login
        window.location.href = "/";
    } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete account. Please try again.");
        setIsDeleting(false);
    }
  };

  // --- HELPERS ---
  const getScoreColor = (score) => {
    if (score === undefined || score === null) return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCardClick = (interviewId) => {
    navigate("/feedback", { state: { interviewId } });
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-cyan-500 gap-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Loading profile...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-xl text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p className="text-red-200">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg text-sm transition">
                    Retry
                </button>
            </div>
        </div>
    );
  }

  return (
    <>
         <div className="w-full max-w-4xl mx-auto p-4 md:p-8 font-sans min-h-screen pb-20">
        
            {/* HEADER */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                      <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                           My <span className="text-cyan-400">Profile</span>
                      </h1>
                      <p className="text-slate-400 mt-1 text-sm">View your progress and past interview history.</p>
                </div>
            </div>

        {/* ================= USER IDENTITY CARD ================= */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl mb-8 group">
           
           {/* Abstract Banner Background */}
           <div className="h-32 w-full bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-slate-900/40 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           </div>

           {/* User Info Container */}
           <div className="px-6 pb-6 relative flex flex-col md:flex-row items-center md:items-end -mt-12 gap-6">
              
              {/* Avatar Circle */}
              <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center shadow-xl relative z-10">
                 {user?.avatarInitial ? (
                    <span className="text-4xl font-black text-cyan-400">{user.avatarInitial}</span>
                 ) : (
                    <UserIcon className="w-10 h-10 text-slate-600" />
                 )}
              </div>

              {/* Text Details */}
              <div className="flex-1 text-center md:text-left mb-2">
                 <h2 className="text-2xl font-bold text-white capitalize">{user?.name}</h2>
                 <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-2 mt-1">
                    <Mail size={14} /> {user?.email}
                 </p>
                 <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold tracking-wider">
                        Joined {user?.joined}
                    </span>
                 </div>
              </div>
           </div>
        </div>

      {/* ================= RECENT ACTIVITY SECTION ================= */}
      <div className="mb-12">
           <div className="flex items-center gap-2 mb-4">
              <History className="text-cyan-400" size={20} />
              <h3 className="text-xl font-bold text-white">Interview History</h3>
           </div>

           <div className="flex flex-col gap-3">
              {interviews.length > 0 ? (
                 interviews.map((item) => (
                    <div 
                      key={item._id} 
                      onClick={() => handleCardClick(item._id)}
                      className="group p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900 transition-all duration-300 cursor-pointer flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                       {/* Left: Info */}
                       <div className="flex items-start gap-4 w-full md:w-auto">
                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors">
                             <Award size={20} />
                          </div>
                          <div>
                             <h4 className="text-white font-bold text-sm md:text-base group-hover:text-cyan-400 transition-colors">
                                {item.jobRole || "Technical Interview"}
                             </h4>
                             <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                                <Calendar size={12} /> {formatDate(item.createdAt)}
                             </p>
                          </div>
                       </div>

                       {/* Right: Score & Action */}
                       <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(item.feedback?.overallScore)}`}>
                             Score: {item.feedback?.overallScore || 0}%
                          </div>
                          <ChevronRight className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" size={18} />
                       </div>
                    </div>
                 ))
              ) : (
               <div className="text-center p-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                  <p className="text-slate-400 font-medium">No interviews found yet.</p>
               </div>
              )}
           </div>
        </div>

      {/* ================= DANGER ZONE (Restored) ================= */}
      <div className="border border-red-900/30 bg-red-950/10 rounded-2xl p-6 md:p-8">
         <h3 className="text-red-500 font-bold mb-2 flex items-center gap-2">
            <AlertCircle size={20} /> Danger Zone
         </h3>
         <p className="text-slate-400 text-sm mb-6">
            Deleting your account is permanent. All your interview history, resumes, and scores will be wiped immediately.
         </p>
         
         <button 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 rounded-lg font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {isDeleting ? (
               <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
               </>
            ) : (
               <>
                  <Trash2 size={16} /> Delete My Account
               </>
            )}
         </button>
      </div>

      </div>
    </>
  );
};

export default Profile;