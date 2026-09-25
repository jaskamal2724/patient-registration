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
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 max-w-md sm:max-w-xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 text-white">
            <Stethoscope size={22} />
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              MediQueue
            </h1>
            <p className="text-xs text-slate-500 font-body font-medium leading-none">
              Smart Patient Registration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <InstallPWA />
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
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100/80 text-blue-600 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider mb-4">
            <Calendar size={13} className="text-blue-600" />
            <span>TODAY&apos;S OPD</span>
          </div>

          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-2">
                Book your appointment
              </h2>
              <p className="font-body text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-5">
                Get your digital token and track your queue live.
              </p>

              {/* Book Appointment Pill Button */}
              <button
                onClick={() => router.push("/patient")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer mb-4"
              >
                <Calendar size={18} />
                <span>Book Appointment</span>
                <ArrowRight size={16} className="ml-0.5" />
              </button>

              {/* Secondary link */}
              <button
                onClick={() => router.push("/patient")}
                className="text-blue-600 hover:text-blue-700 font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>How it works</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Right OPD Clipboard Graphic Illustration */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
              {/* Soft blue glowing circular backdrop */}
              <div className="absolute inset-0 bg-blue-50/90 rounded-full blur-2xs" />
              
              {/* Floating accent dots */}
              <div className="absolute top-1 left-2 w-3 h-3 bg-blue-200/80 rounded-full" />
              <div className="absolute bottom-2 right-1 w-2.5 h-2.5 bg-blue-300/60 rounded-full" />

              {/* Clipboard Document */}
              <div className="relative z-10 bg-white rounded-2xl shadow-md border border-blue-100/90 p-3 w-26 sm:w-30 flex flex-col items-center">
                {/* Header Blue Medical Cross */}
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2 shadow-2xs">
                  <span className="font-bold text-base leading-none text-blue-600">+</span>
                </div>

                {/* Token Badge */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1 text-center w-full shadow-2xs">
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Token</p>
                  <p className="text-xs sm:text-sm font-extrabold text-blue-600 font-mono-custom">A024</p>
                </div>
              </div>

              {/* Floating Clock with Live Pill */}
              <div className="absolute -bottom-1 -right-1 z-20 flex flex-col items-end gap-1">
                <div className="w-8 h-8 rounded-full bg-white shadow-md border border-blue-100 flex items-center justify-center text-blue-600">
                  <Clock size={16} />
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3-Feature Row */}
          <div className="border-t border-slate-100 pt-4 grid grid-cols-3 divide-x divide-slate-100 text-center">
            <div className="px-2 flex flex-col items-center">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <Ticket size={14} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700">Digital Token</span>
            </div>
            <div className="px-2 flex flex-col items-center">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <Radio size={14} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700">Live Queue</span>
            </div>
            <div className="px-2 flex flex-col items-center">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <User size={14} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700">Simple Registration</span>
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
