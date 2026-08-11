"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import {
  Stethoscope,
  User,
  Lock,
  ArrowRight,
  Heart,
  Shield,
  Clock,
} from "lucide-react";
import InstallPWA from "./InstallPWA";

export default function LandingPage() {
  const router = useRouter();
  const [showPinModal, setShowPinModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen relative overflow-hidden bg-surface-50">
      <div className="blob-bg w-[500px] h-[500px] bg-brand-200 top-0 -left-40 mix-blend-multiply animate-float" />
      <div
        className="blob-bg w-[400px] h-[400px] bg-accent-200 bottom-0 right-0 mix-blend-multiply animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="blob-bg w-[600px] h-[600px] bg-brand-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply animate-float"
        style={{ animationDelay: "4s" }}
      />

      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-surface-900 leading-tight">
              MediQueue
            </p>
            <p className="text-xs text-surface-500 font-body mb-1.5">
              Smart Patient Registration
            </p>
            <InstallPWA />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-4 py-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-brand-500 status-live" />
          <span className="font-body font-medium">System Online</span>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20">
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono-custom tracking-widest text-brand-600 bg-brand-50 border border-brand-100/50 rounded-full px-4 py-1.5 mb-6 uppercase shadow-sm">
            <span className="w-1 h-1 rounded-full bg-brand-500"></span>
            Patient Management
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-surface-900 leading-tight mb-6 tracking-tight">
            Seamless Care,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">
              Zero Wait
            </span>{" "}
            Confusion.
          </h1>
          <p className="font-body text-lg text-surface-500 max-w-xl mx-auto leading-relaxed">
            Patients register in seconds. Doctors manage the queue with ease.
            Everyone knows their exact token number.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          <button
            onClick={() => setShowPinModal(true)}
            className="group glass-card card-lift rounded-3xl p-8 text-left cursor-pointer border border-surface-200/50"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform duration-300">
              <Stethoscope size={26} className="text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-2">
              Doctor Portal
            </h2>
            <p className="font-body text-sm text-surface-500 leading-relaxed mb-6">
              Open or close registration, manage patient queue, control today's
              session with advanced tools.
            </p>
            <div className="flex items-center gap-2 text-brand-600 font-body text-sm font-semibold">
              <Lock size={14} className="text-brand-500" />
              <span>Secure Login</span>
              <ArrowRight
                size={14}
                className="ml-auto group-hover:translate-x-1.5 transition-transform duration-300"
              />
            </div>
          </button>

          <button
            onClick={() => router.push("/patient")}
            className="group glass-card card-lift rounded-3xl p-8 text-left cursor-pointer border border-surface-200/50"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center mb-5 shadow-lg shadow-accent-500/30 group-hover:scale-105 transition-transform duration-300">
              <User size={26} className="text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-2">
              Patient Portal
            </h2>
            <p className="font-body text-sm text-surface-500 leading-relaxed mb-6">
              Register yourself for today's OPD, get your digital token number,
              and track the queue live.
            </p>
            <div className="flex items-center gap-2 text-accent-600 font-body text-sm font-semibold">
              <span>No login required</span>
              <ArrowRight
                size={14}
                className="ml-auto group-hover:translate-x-1.5 transition-transform duration-300"
              />
            </div>
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm text-surface-500 font-body font-medium">
          {[
            { icon: Heart, text: "Trusted by clinics" },
            { icon: Shield, text: "Private & secure" },
            { icon: Clock, text: "Real-time queue" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center">
                <Icon size={12} className="text-brand-500" />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </main>

      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-surface-900/20 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-surface-100 animate-slide-up relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-accent-400"></div>

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
