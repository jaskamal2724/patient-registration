"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as api from "@/lib/api";
import {
  Stethoscope,
  Lock,
  ArrowRight,
  UserCheck,
  Calendar,
  Ticket,
  Radio,
  User,
  Clock,
} from "lucide-react";
import InstallPWA from "./InstallPWA";
import LogiquelAdCard from "./LogiquelAdCard";
import LogiquelLogo from "./LogiquelLogo";

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPinModal, setShowPinModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const doc = await api.fetchDoctorProfile();
      if (doc) setIsLoggedIn(true);
    })();
    if (searchParams.get("login") === "true") {
      setShowPinModal(true);
    }
  }, [searchParams]);

  const handleDoctorLogin = async () => {
    if (!email.trim() || !password) return;
    setLoginError(false);
    setLoading(true);
    try {
      await api.signIn(email.trim(), password);
      router.push("/doctor");
    } catch (e) {
      setLoginError(true);
      setError(
        e instanceof Error ? e.message : "Invalid credentials. Try again.",
      );
      setTimeout(() => {
        setLoginError(false);
        setError(null);
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between">
      {/* Top Header */}
      <header className="relative z-10 flex items-start justify-between px-4 sm:px-6 py-4 max-w-md sm:max-w-xl w-full mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 text-white mt-0.5">
            <Stethoscope size={22} />
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              MediQueue
            </h1>
            <p className="text-xs text-slate-500 font-body font-medium leading-none mb-2">
              Smart Patient Registration
            </p>
            <InstallPWA />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isLoggedIn) {
                router.push("/doctor");
              } else {
                setShowPinModal(true);
              }
            }}
            className="flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full px-4 py-2 font-body text-xs sm:text-sm font-bold transition-all shadow-md hover:scale-[1.03] active:scale-[0.97] border border-slate-700/50 cursor-pointer"
          >
            {isLoggedIn ? (
              <UserCheck size={16} className="text-emerald-400" />
            ) : (
              <Stethoscope size={16} className="text-blue-400" />
            )}
            <span>Dr. Login</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-8 flex-1">
        {/* Top OPD Booking Card (Image 2 Top Card) */}
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden mb-6 text-left">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-1.5 bg-[#EBF3FF] border border-[#D0E2FF] text-[#1D68F3] rounded-full px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider mb-4">
            <Calendar size={14} className="text-[#1D68F3]" />
            <span>Doctor Sarvesh OPD</span>
          </div>

          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-5">
            <div className="flex-1 min-w-0 pr-1">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B1527] tracking-tight leading-snug mb-2">
                Book your<br />appointment
              </h2>
              <p className="font-body text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-4 sm:mb-5 max-w-[240px]">
                Get your digital token and track your queue live.
              </p>

              {/* Book Appointment Pill Button */}
              <button
                onClick={() => router.push("/patient")}
                className="bg-[#1D68F3] hover:bg-[#1554C6] text-white font-bold text-xs sm:text-sm px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap w-fit"
              >
                <Calendar size={16} className="shrink-0" />
                <span>Book your slot</span>
                <ArrowRight size={14} className="shrink-0" />
              </button>
            </div>

            {/* Right OPD Clipboard Graphic Illustration (Compact & Scaled) */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
              {/* Soft light blue circular backdrop */}
              <div className="absolute inset-0 bg-[#F0F6FF] rounded-full -z-0" />

              {/* Clipboard Document Box */}
              <div className="relative z-10 bg-white rounded-xl sm:rounded-2xl shadow-md border border-blue-100/90 p-2.5 sm:p-3 w-24 sm:w-30 h-28 sm:h-36 flex flex-col justify-between">
                {/* Header Blue Medical Cross Badge */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#1D68F3] text-white flex items-center justify-center shadow-xs mx-auto mb-1">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                    </svg>
                  </div>
                  {/* Skeleton lines */}
                  <div className="w-12 sm:w-16 h-1 bg-[#D0E2FF] rounded-full mb-1" />
                  <div className="w-8 sm:w-10 h-1 bg-[#E2EEFF] rounded-full" />
                </div>

                {/* Token A024 Badge */}
                <div className="bg-white rounded-lg border border-slate-200/90 p-1 sm:p-1.5 shadow-xs text-left w-20 sm:w-24 -ml-1">
                  <p className="text-[9px] text-slate-400 font-semibold font-body leading-none">Token</p>
                  <p className="text-xs sm:text-sm font-extrabold text-[#1D68F3] font-mono-custom tracking-wider leading-none mt-0.5">A024</p>
                </div>
              </div>

              {/* Floating Blue Outline Clock Icon */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-[#1D68F3] text-[#1D68F3] flex items-center justify-center shadow-md z-20 absolute bottom-6 right-1 sm:right-2">
                <Clock size={13} strokeWidth={2.5} />
              </div>

              {/* Floating Green Live Badge */}
              <div className="bg-[#00B887] text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-30 absolute bottom-0 right-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Live</span>
              </div>
            </div>
          </div>

          {/* Bottom 3-Feature Bar (Exact Screenshot Soft Blue Container) */}
          <div className="bg-[#F4F8FF] rounded-2xl p-2.5 sm:p-3.5 grid grid-cols-3 divide-x divide-blue-100/90 text-center items-center mt-2">
            <div className="px-1 flex items-center justify-center gap-1.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-blue-100/80 text-[#1D68F3] flex items-center justify-center shrink-0 shadow-2xs">
                <Ticket size={14} />
              </div>
              <div className="flex flex-col text-left text-[10px] sm:text-xs font-bold text-slate-700 leading-tight min-w-0">
                <span className="truncate">Digital</span>
                <span className="truncate">Token</span>
              </div>
            </div>

            <div className="px-1 flex items-center justify-center gap-1.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-blue-100/80 text-[#1D68F3] flex items-center justify-center shrink-0 shadow-2xs">
                <Radio size={14} />
              </div>
              <div className="flex flex-col text-left text-[10px] sm:text-xs font-bold text-slate-700 leading-tight min-w-0">
                <span className="truncate">Live</span>
                <span className="truncate">Queue</span>
              </div>
            </div>

            <div className="px-1 flex items-center justify-center gap-1.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-blue-100/80 text-[#1D68F3] flex items-center justify-center shrink-0 shadow-2xs">
                <User size={14} />
              </div>
              <div className="flex flex-col text-left text-[10px] sm:text-xs font-bold text-slate-700 leading-tight min-w-0">
                <span className="truncate">Easy</span>
                <span className="truncate">Register</span>
              </div>
            </div>
          </div>
        </div>

        {/* LOGIQUEL Banner (Image 2 Middle Card) */}
        <LogiquelAdCard variant="landing" />
      </main>

      

      {/* Doctor Login Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border border-slate-100 animate-slide-up relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
              <Lock size={22} />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">
              Doctor Login
            </h3>
            <p className="font-body text-xs sm:text-sm text-slate-500 mb-6 font-medium">
              Enter your credentials to access the dashboard.
            </p>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
              className={`w-full rounded-2xl px-4 py-3 font-body text-sm mb-3 border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                loginError
                  ? "border-red-300 bg-red-50 text-red-900"
                  : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
              }`}
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
              className={`w-full rounded-2xl px-4 py-3 font-body text-sm mb-2 border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                loginError
                  ? "border-red-300 bg-red-50 text-red-900 animate-pulse"
                  : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
              }`}
            />
            {loginError && (
              <p className="text-red-500 text-xs font-body font-medium text-center mb-3">
                {error || "Invalid credentials. Try again."}
              </p>
            )}

            <button
              onClick={handleDoctorLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-2xl py-3.5 font-body font-bold text-sm transition-all shadow-md shadow-blue-500/25 mb-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Access Dashboard"
              )}
            </button>
            <button
              onClick={() => {
                setShowPinModal(false);
                setEmail("");
                setPassword("");
              }}
              className="w-full text-slate-400 hover:text-slate-600 text-xs py-2 font-body font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
