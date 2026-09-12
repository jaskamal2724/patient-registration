"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as api from "@/lib/api";
import {
  Stethoscope,
  User,
  Lock,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import InstallPWA from "./InstallPWA";
import LogiquelFooter from "./LogiquelFooter";

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
    <div className="min-h-screen relative overflow-x-hidden max-w-full bg-surface-50">
      <div className="blob-bg w-125 h-125 bg-brand-200 top-0 -left-40 mix-blend-multiply animate-float" />
      <div
        className="blob-bg w-100 h-100 bg-accent-200 bottom-0 right-0 mix-blend-multiply animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="blob-bg w-150 h-150 bg-brand-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply animate-float"
        style={{ animationDelay: "4s" }}
      />

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-2.5 sm:py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display text-base sm:text-lg font-bold text-surface-900 leading-tight">
              MediQueue
            </p>
            <p className="text-[11px] text-surface-500 font-body mb-0.5">
              Smart Patient Registration
            </p>
            <InstallPWA />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3.5 py-1.5 shadow-xs">
            <div className="w-2 h-2 rounded-full bg-brand-500 status-live" />
            <span className="font-body font-medium">System Online</span>
          </div>
          <button
            onClick={() => {
              if (isLoggedIn) {
                router.push("/doctor");
              } else {
                setShowPinModal(true);
              }
            }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 py-2 font-body text-xs sm:text-sm font-bold transition-all shadow-md shadow-slate-900/25 hover:shadow-slate-900/40 hover:scale-105 active:scale-95 border border-slate-700 cursor-pointer"
          >
            {isLoggedIn ? (
              <UserCheck size={15} className="text-emerald-400" />
            ) : (
              <Stethoscope size={15} className="text-brand-400" />
            )}
            <span>Dr. Login</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 pb-2">
        <div className="flex justify-center mb-4 sm:mb-6">
          <button
            onClick={() => router.push("/patient")}
            className="group bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 text-left cursor-pointer border border-surface-200/80 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-md md:max-w-2xl lg:max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-3 md:mb-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors duration-300">
                <User size={22} className="text-brand-600 md:w-7 md:h-7" />
              </div>
              <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-surface-900">
                Patient Portal
              </h2>
            </div>
            <p className="font-body text-xs sm:text-sm md:text-base text-surface-500 leading-relaxed mb-4 md:mb-6">
              Register yourself for today&apos;s OPD, get your digital token number,
              and track the queue live.
            </p>
            <div className="flex items-center gap-2 text-brand-600 font-body text-xs sm:text-sm md:text-base font-semibold">
              <span>No login required</span>
              <ArrowRight
                size={16}
                className="ml-auto group-hover:translate-x-1.5 transition-transform duration-300"
              />
            </div>
          </button>
        </div>
      </main>

      <LogiquelFooter />

      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-surface-900/20 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-surface-100 animate-slide-up relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-400 to-accent-400"></div>

            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
              <Lock size={22} className="text-brand-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-surface-900 mb-1">
              Doctor Login
            </h3>
            <p className="font-body text-sm text-surface-500 mb-6">
              Enter your credentials to access the dashboard.
            </p>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
              className={`input-field w-full rounded-2xl px-5 py-3.5 font-body text-sm mb-3 border ${
                loginError
                  ? "border-red-300 bg-red-50"
                  : "border-surface-200 bg-surface-50 text-surface-900"
              }`}
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
              className={`input-field w-full rounded-2xl px-5 py-3.5 font-body text-base mb-2 border ${
                loginError
                  ? "border-red-300 bg-red-50 text-red-900 animate-pulse"
                  : "border-surface-200 bg-surface-50 text-surface-900"
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
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-2xl py-3.5 font-body font-semibold transition-colors shadow-lg shadow-brand-500/25 mb-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
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
              className="w-full text-surface-400 hover:text-surface-600 text-sm py-2 font-body font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
