import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // <--- Redux Imports
import { loginUser, clearError } from '../redux/authslice'; // <--- Import Thunk & Action
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, AlertTriangle } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Get Global State from Redux (Loading & Error)
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" });

  // 2. Clear errors when the component unmounts or loads
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 3. Redirect if already logged in (Optional but good UX)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    // 4. Dispatch the Login Action
    const resultAction = await dispatch(loginUser({
      email: data.email,
      password: data.password
    }));

    // 5. Handle Navigation on Success
    // (We check if the action was "fulfilled" - meaning success)
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-full px-4 pt-8 lg:pt-6 pb-8 lg:flex-row lg:gap-20 lg:-translate-x-6 overflow-hidden font-sans">
        
        {/* BRAND SECTION */}
        <div className="text-center lg:text-left mb-6 lg:mb-0 lg:max-w-md animate-in fade-in slide-in-from-left duration-700">
          <h1 className="text-5xl md:text-5xl lg:text-6xl font-black leading-normal tracking-tighter mb-1 italic">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 pr-2">
              ECHO
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 pb-2 pr-2">
              PREP
            </span>
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base lg:text-lg font-medium max-w-[300px] md:max-w-full mx-auto lg:mx-0 opacity-80">
            Master your future with <span className="text-cyan-400"> AI-driven technical interview coaching.</span> 
          </p>
        </div>

        {/* FORM SECTION */}
        <div className="w-full max-w-[95%] sm:max-w-[400px] bg-black/40 backdrop-blur-xl border border-blue-900/40 rounded-[2rem] p-6 md:p-10 shadow-2xl animate-in fade-in slide-in-from-right duration-700">
          <div className="text-center mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">
              Log in to your professional dashboard
            </p>
          </div>

          {/* SERVER ERROR ALERT (From Redux State) */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertTriangle className="text-red-400 shrink-0" size={16} />
              <p className="text-red-400 text-xs font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-500 group-focus-within:text-cyan-400'}`} size={16} />
                <input
                  {...register("email", { 
                    required: "Email is required",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                  })}
                  className={`w-full bg-slate-900/50 border ${errors.email ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-slate-800 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5'} rounded-xl py-3.5 pl-10 pr-4 text-white text-sm outline-none transition-all`}
                  placeholder="name@email.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-[11px] font-semibold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-500 group-focus-within:text-cyan-400'}`} size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" }
                  })}
                  className={`w-full bg-slate-900/50 border ${errors.password ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-slate-800 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5'} rounded-xl py-3.5 pl-10 pr-12 text-white text-sm outline-none transition-all`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-[11px] font-semibold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm mt-4 uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : "SIGN IN"}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-500 text-xs md:text-sm tracking-wide">
            Don't have an account?{" "}
            <Link to="/signup" className="text-cyan-400 font-bold hover:underline ml-1">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;