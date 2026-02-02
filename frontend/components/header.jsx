import React, { useState, useEffect } from "react";
import { Menu, X, Home, User, LogOut, ChevronRight } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // <--- Import Redux Hook
import { logoutUser } from "../redux/authslice"; // <--- Import Logout Action

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // <--- Initialize Dispatch

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: "Home", icon: <Home size={18} />, to: "/" },
    { name: "Profile", icon: <User size={18} />, to: "/profile" },
  ];

  // --- LOGOUT LOGIC (REDUX VERSION) ---
  const handleLogout = async () => {
    // 1. Dispatch the Logout Thunk
    // This handles the Backend API call AND clears the Redux 'user' state
    await dispatch(logoutUser());

    // 2. Close mobile menu if open
    setIsOpen(false);

    // 3. Redirect to Login
    navigate("/login");
  };

  return (
    // Header Container: h-20 (5rem/80px)
    <header className="sticky top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-xl h-20 flex items-center relative font-sans border-b border-white/5 transition-all duration-300">
      
      {/* Top Glow */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between relative h-full">
        
        {/* Left Spacer */}
        <div className="flex-1 md:hidden"></div>
        <div className="hidden md:flex flex-1"></div>

        {/* Brand Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex-1 text-center z-20">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight md:tracking-wide select-none cursor-pointer group">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 group-hover:to-white transition-all duration-500">Echo</span><span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 group-hover:brightness-125 transition-all duration-500">Prep</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 ml-2 group-hover:to-white transition-all duration-500 text-lg md:text-xl">AI</span>
          </h1>
        </div>

        {/* Right Navigation */}
        <div className="flex-1 flex justify-end items-center gap-6">
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors duration-300 group ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`
                }
              >
                <span className="group-hover:-translate-y-0.5 transition-transform duration-300">{link.icon}</span>
                {link.name}
              </NavLink>
            ))}

            <button 
                onClick={handleLogout}
                className="group relative px-5 py-2 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300 overflow-hidden cursor-pointer"
            >
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest group-hover:text-red-300 z-10 relative">
                    <span>Logout</span>
                    <LogOut size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden relative z-50 p-2 text-cyan-400 hover:bg-cyan-950/50 rounded-xl transition-all duration-300 border border-transparent hover:border-cyan-500/30 group"
          >
            <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                {isOpen ? <X size={28} /> : <Menu size={28} />}
            </div>
          </button>
        </div>
      </div>

      {/* === MOBILE MENU CONTAINER === */}
      <div 
        className={`fixed top-20 left-0 w-full h-[calc(100vh-5rem)] z-40 flex flex-col transition-all duration-300 md:hidden 
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        
        {/* The blur overlay background */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        ></div>

        {/* The Menu Content (Slides down) */}
        <div className={`relative w-full bg-[#020617] border-b border-cyan-500/20 shadow-2xl flex flex-col transition-all duration-300 ease-out origin-top
            ${isOpen ? 'translate-y-0' : '-translate-y-10'}`}
        >
            <div className="flex flex-col gap-2 p-6">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between p-4 rounded-xl transition-all border border-transparent group ${isActive ? 'bg-white/5 text-cyan-400' : 'text-slate-300 hover:text-cyan-400 hover:bg-white/5 hover:border-cyan-500/10'}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      {link.icon}
                      <span className="text-sm font-bold uppercase tracking-widest">{link.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </NavLink>
                ))}

                <button 
                    onClick={handleLogout}
                    className="mt-4 flex items-center justify-center gap-2 w-full p-4 rounded-xl bg-red-900/10 border border-red-500/20 text-red-400 font-bold text-sm uppercase tracking-widest hover:bg-red-900/20 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)] transition-all group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Logout
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;