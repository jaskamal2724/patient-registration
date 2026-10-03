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
  MapPin,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react";
import InstallPWA from "./InstallPWA";
import LogiquelAdCard from "./LogiquelAdCard";
import LogiquelLogo from "./LogiquelLogo";
import DocCareLogo from "./DocCareLogo";
import LoadingScreen from "./LoadingScreen";
import LanguageSelector from "./LanguageSelector";
import TreatedConditionsModal from "./TreatedConditionsModal";
import { useLanguage } from "@/lib/LanguageContext";

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [showPortalLoading, setShowPortalLoading] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showConditionsModal, setShowConditionsModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPortalLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        e instanceof Error ? e.message : t("invalidCredentials"),
      );
      setTimeout(() => {
        setLoginError(false);
        setError(null);
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  if (showPortalLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between">
      {/* Top Header */}
      <header className="relative z-10 flex items-start justify-between px-4 sm:px-6 py-4 max-w-md sm:max-w-xl w-full mx-auto gap-2">
        <div className="flex flex-col gap-1.5">
          <DocCareLogo variant="full" subtitle={t("appSubtitle")} />
          <div className="flex items-center gap-2 flex-wrap">
            <InstallPWA />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <LanguageSelector />
          <button
            onClick={() => {
              if (isLoggedIn) {
                router.push("/doctor");
              } else {
                setShowPinModal(true);
              }
            }}
            className="flex items-center gap-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full px-3 sm:px-3.5 py-1.5 font-body text-xs font-bold transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] border border-slate-700/50 cursor-pointer shrink-0"
          >
            {isLoggedIn ? (
              <UserCheck size={14} className="text-emerald-400 shrink-0" />
            ) : (
              <Stethoscope size={14} className="text-[#0066FF] shrink-0" />
            )}
            <span>{t("doctorLogin")}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-8 flex-1">
        {/* Top OPD Booking Card (Image 2 Top Card) */}
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden mb-6 text-left">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-1 bg-[#EBF3FF] border border-[#D0E2FF] text-[#1D68F3] rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide mb-3 shadow-2xs">
            <Calendar size={12} className="text-[#1D68F3] shrink-0" />
            <span>{t("doctorName")}</span>
          </div>

          {/* Top Row: Title/Subtitle on Left + OPD Illustration on Right */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4">
            <div className="flex-1 min-w-0 pr-1">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B1527] tracking-tight leading-snug mb-2 whitespace-pre-line">
                {t("bookAppointmentTitle")}
              </h2>
              <p className="font-body text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-[240px]">
                {t("bookAppointmentSubtitle")}
              </p>
            </div>

            {/* Right Column: OPD Clipboard Graphic Illustration */}
            <div className="relative w-28 h-28 sm:w-34 sm:h-34 shrink-0 flex items-center justify-center">
              {/* Soft light blue circular backdrop */}
              <div className="absolute inset-0 bg-[#F0F6FF] rounded-full -z-0" />

              {/* Clipboard Document Box */}
              <div className="relative z-10 bg-white rounded-xl sm:rounded-2xl shadow-md border border-blue-100/90 p-2.5 sm:p-3 w-24 sm:w-28 h-28 sm:h-32 flex flex-col justify-between">
                {/* Header Blue Medical Cross Badge */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1D68F3] text-white flex items-center justify-center shadow-xs mx-auto mb-1">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                    </svg>
                  </div>
                  {/* Skeleton lines */}
                  <div className="w-12 sm:w-14 h-1 bg-[#D0E2FF] rounded-full mb-1" />
                  <div className="w-8 sm:w-10 h-1 bg-[#E2EEFF] rounded-full" />
                </div>

                {/* Token A024 Badge */}
                <div className="bg-white rounded-lg border border-slate-200/90 p-1 sm:p-1.5 shadow-xs text-left w-20 sm:w-22 -ml-1">
                  <p className="text-[9px] text-slate-400 font-semibold font-body leading-none">{t("tokenBadge")}</p>
                  <p className="text-xs sm:text-sm font-extrabold text-[#1D68F3] font-mono-custom tracking-wider leading-none mt-0.5">A024</p>
                </div>
              </div>

              {/* Floating Blue Outline Clock Icon */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-[#1D68F3] text-[#1D68F3] flex items-center justify-center shadow-md z-20 absolute bottom-5 right-1">
                <Clock size={13} strokeWidth={2.5} />
              </div>

              {/* Floating Green Live Badge */}
              <div className="bg-[#00B887] text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-30 absolute bottom-0 right-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{t("liveBadge")}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Book Slot + What We Treat (2-Col Grid) + Location Pill */}
          <div className="flex flex-col items-start gap-2.5 mb-4 w-full">
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full">
              <button
                onClick={() => router.push("/patient")}
                className="bg-[#1D68F3] hover:bg-[#1554C6] text-white font-bold text-[11px] sm:text-xs md:text-sm py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1 sm:gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-w-0 text-center"
              >
                <Calendar size={14} className="shrink-0" />
                <span className="truncate">{t("bookSlotBtn")}</span>
                <ArrowRight size={13} className="shrink-0 hidden xs:inline-block sm:inline-block" />
              </button>

              <button
                onClick={() => setShowConditionsModal(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 font-bold text-[11px] sm:text-xs md:text-sm py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl shadow-2xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-w-0 text-center"
              >
                <Activity size={14} className="text-emerald-600 shrink-0" />
                <span className="truncate">{t("viewTreatedConditionsBtn")}</span>
              </button>
            </div>

            <a
              href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 active:scale-95 border border-orange-200/90 rounded-xl px-3 py-1.5 sm:py-2 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap"
              title="Clinic Location on Google Maps"
            >
              <MapPin size={13} className="text-orange-600 shrink-0" />
              <span>{t("clickToKnowGoogleMapLocation")}</span>
            </a>
          </div>

          {/* Bottom 3-Feature Bar */}
          <div className="bg-[#F4F8FF] border border-blue-100/70 rounded-2xl p-2.5 sm:p-3.5 grid grid-cols-3 divide-x divide-blue-100/90 text-center items-center mt-2">
            <div className="px-1 sm:px-2 flex flex-col xs:flex-row items-center justify-center gap-1 sm:gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-blue-100/80 text-[#1D68F3] flex items-center justify-center shrink-0 shadow-2xs">
                <Ticket size={14} className="sm:w-4 sm:h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 leading-tight text-center xs:text-left break-words">
                {t("digitalToken")}
              </span>
            </div>

            <div className="px-1 sm:px-2 flex flex-col xs:flex-row items-center justify-center gap-1 sm:gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-blue-100/80 text-[#1D68F3] flex items-center justify-center shrink-0 shadow-2xs">
                <Radio size={14} className="sm:w-4 sm:h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 leading-tight text-center xs:text-left break-words">
                {t("liveQueue")}
              </span>
            </div>

            <div className="px-1 sm:px-2 flex flex-col xs:flex-row items-center justify-center gap-1 sm:gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-blue-100/80 text-[#1D68F3] flex items-center justify-center shrink-0 shadow-2xs">
                <User size={14} className="sm:w-4 sm:h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 leading-tight text-center xs:text-left break-words">
                {t("easyRegister")}
              </span>
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
              {t("doctorLoginTitle")}
            </h3>
            <p className="font-body text-xs sm:text-sm text-slate-500 mb-6 font-medium">
              {t("doctorLoginSubtitle")}
            </p>

            <input
              type="email"
              placeholder={t("emailAddress")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
              className={`w-full rounded-2xl px-4 py-3 font-body text-sm sm:text-base font-semibold mb-3 border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-normal ${
                loginError
                  ? "border-red-300 bg-red-50 text-red-950"
                  : "border-slate-300 bg-white text-slate-950 focus:bg-white focus:border-blue-500"
              }`}
              autoFocus
            />
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
                className={`w-full rounded-2xl pl-4 pr-11 py-3 font-body text-sm sm:text-base font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-normal ${
                  loginError
                    ? "border-red-300 bg-red-50 text-red-950 animate-pulse"
                    : "border-slate-300 bg-white text-slate-950 focus:bg-white focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loginError && (
              <p className="text-red-500 text-xs font-body font-medium text-center mb-3">
                {error || t("invalidCredentials")}
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
                t("accessDashboard")
              )}
            </button>
            <button
              onClick={() => {
                setShowPinModal(false);
                setEmail("");
                setPassword("");
                setShowPassword(false);
              }}
              className="w-full text-slate-400 hover:text-slate-600 text-xs py-2 font-body font-semibold transition-colors cursor-pointer"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Treated Conditions Popup Modal */}
      <TreatedConditionsModal
        isOpen={showConditionsModal}
        onClose={() => setShowConditionsModal(false)}
      />
    </div>
  );
}
