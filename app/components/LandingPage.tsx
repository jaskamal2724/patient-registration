"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as api from "@/lib/api";
import { usePatientView } from "@/lib/usePatientView";
import type { Patient } from "@/lib/types";
import {
  Stethoscope,
  Lock,
  UserCheck,
  Clock,
  Eye,
  EyeOff,
  Phone,
  Search,
  X,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Coffee,
} from "lucide-react";
import LogiquelAdCard from "./LogiquelAdCard";
import DocCareLogo from "./DocCareLogo";
import LoadingScreen from "./LoadingScreen";
import LanguageSelector from "./LanguageSelector";
import DoctorDelayBanner from "./DoctorDelayBanner";
import InstallPWA from "./InstallPWA";
import { useLanguage } from "@/lib/LanguageContext";
import { CLINIC_MAP_URL, handleClinicMapClick } from "../util/mapLink";
import {
  isDateToday,
  isDateInFuture,
  formatVisitDate,
} from "../util/timeSlot";
import { DoctorAvatarSVG } from "./PatientPortalIllustrations";
import {
  BookedSlotCalendarSVG,
  YellowSmileSwooshSVG,
  GlowingBulbSVG,
  OpenMapFoldedSVG,
  SupportHeadsetSVG,
  LocationTeardropPinSVG,
} from "./PatientPortalIllustrations";
import {
  SmartArrivalGuidance,
  PriorityQueueNotice,
  SuccessScreen,
} from "./PatientPortal";

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageRef = useRef<HTMLDivElement>(null);
  const { t, language, tTimeSlot, tTime12Hour, tWaitTime, tPatientName } = useLanguage();

  const [showPortalLoading, setShowPortalLoading] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Search & Patient Ticket View
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const {
    regWindow,
    patients,
    walkinPatients,
    initialLoading,
    initialLoadError,
    retryInitialLoad,
  } = usePatientView();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPortalLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    (async () => {
      const doc = await api.fetchDoctorProfile();
      if (doc) setIsLoggedIn(true);
    })();
    if (searchParams.get("login") === "true") {
      setShowPinModal(true);
      if (searchParams.get("expired") === "true") {
        setError(
          language === "hi"
            ? "सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।"
            : "Your session has expired. Please sign in again."
        );
      }
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
      setError(e instanceof Error ? e.message : t("invalidCredentials"));
      setTimeout(() => {
        setLoginError(false);
        setError(null);
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  // Live Queue & Status Calculations
  const inProgress = patients.find(
    (p) => p.status === "in-progress" || (p.status as string) === "in_progress",
  );
  const inProgressWalkin = (walkinPatients || []).find(
    (p) => p.status === "in-progress" || (p.status as string) === "in_progress",
  );
  const waitingPatients = patients.filter((p) => p.status === "waiting");
  const nextPatient = waitingPatients[0] || null;
  const nextWalkinPatient =
    (walkinPatients || []).find((p) => p.status === "waiting") || null;
  const hasWaitingPatients = waitingPatients.length > 0;
  const allPatientsDone =
    patients.length > 0 &&
    patients.every((p) => p.status === "done" || p.status === "skipped");
  const isAppointmentListFinished =
    allPatientsDone ||
    (patients.length > 0 && !inProgress && !hasWaitingPatients);
  const hasWaitingWalkin = (walkinPatients || []).some(
    (p) =>
      p.status === "waiting" ||
      p.status === "in-progress" ||
      (p.status as string) === "in_progress",
  );
  const isDoctorVisitingToday = isDateToday(regWindow.date);
  const isFutureDate = isDateInFuture(regWindow.date);
  const formattedVisitDate = formatVisitDate(regWindow.date, language);
  const doctorHasStarted = Boolean(inProgress || inProgressWalkin);
  const lastConsultedPatient = patients
    .filter((p) => p.status === "done" || (p.status as string) === "completed")
    .sort(
      (a, b) =>
        (b.slot_token_number || b.token_number) -
        (a.slot_token_number || a.token_number),
    )[0];

  // Search Results
  const cleanPhone = searchPhone.replace(/\D/g, "");
  const searchResults =
    cleanPhone.length >= 3
      ? patients.filter((p) => p.phone.replace(/\D/g, "").includes(cleanPhone))
      : [];

  if (showPortalLoading && initialLoading) {
    return <LoadingScreen />;
  }

  // If a user selected their ticket to view
  if (selectedPatient) {
    return (
      <div
        ref={pageRef}
        className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between"
      >
        <header className="relative z-30 flex items-start justify-between px-4 sm:px-6 py-4 max-w-md sm:max-w-xl w-full mx-auto gap-2">
          <div className="flex flex-col gap-1.5">
            <DocCareLogo variant="full" subtitle={t("appSubtitle")} />
            <div className="flex items-center gap-2 flex-wrap">
              <InstallPWA />
            </div>
          </div>
          <LanguageSelector />
        </header>

        <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-28 sm:pb-32 flex-1">
          <SuccessScreen
            patient={selectedPatient}
            patients={patients}
            walkinPatients={walkinPatients}
            doctorIsSeeingPatient={doctorHasStarted}
            pageRef={pageRef}
            delayMinutes={regWindow.delayMinutes}
            onBackToHome={() => setSelectedPatient(null)}
            onViewQueue={() => setSelectedPatient(null)}
            onBookAnother={() => router.push("/patient-registration")}
          />
        </main>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between"
    >
      {/* Top Header */}
      <header className="relative z-30 flex items-start justify-between px-4 sm:px-6 py-4 max-w-md sm:max-w-xl w-full mx-auto gap-2">
        <div className="flex flex-col gap-1.5">
          <DocCareLogo variant="full" subtitle={t("appSubtitle")} />
          <div className="flex items-center gap-2 flex-wrap">
            <InstallPWA />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0 relative z-30">
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
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-28 sm:pb-32 flex-1">
        {/* Doctor Delay Alert Banner across all patient portal views */}
        {!initialLoading && regWindow.delayMinutes > 0 && (
          <div className="mb-4">
            <DoctorDelayBanner
              delayMinutes={regWindow.delayMinutes}
              variant="card"
            />
          </div>
        )}

        {/* TILE 1: Live Queue / Doctor Visiting Status */}
        {initialLoading ? (
          /* Card Loader while deciding registration / doctor status */
          <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left relative overflow-hidden">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 flex items-center justify-center shrink-0 shadow-2xs">
                <Loader2 className="w-7 h-7 text-[#1D68F3] animate-spin" />
              </div>
              <div className="space-y-2.5 py-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full w-36 sm:w-48 animate-pulse block" />
                  <span className="h-4 w-10 bg-slate-100 rounded-full animate-pulse block" />
                </div>
                <p className="h-3.5 bg-slate-100 rounded-md w-full max-w-[240px] animate-pulse block" />
                <p className="h-3 bg-slate-100/70 rounded-md w-3/4 max-w-[180px] animate-pulse block" />
              </div>
            </div>

            {/* Status Bar Loader */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-extrabold shadow-md shadow-blue-500/25 mt-2.5 transition-all">
              <div className="flex items-center gap-2 min-w-0">
                <Loader2 size={15} className="text-white shrink-0 animate-spin" />
                <span className="font-extrabold text-white truncate">
                  {t("checkingOpdStatus")}
                </span>
              </div>
              <span className="bg-white/20 backdrop-blur-xs rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-mono-custom font-semibold text-white shrink-0 animate-pulse">
                {t("verifyingScheduleMsg")}
              </span>
            </div>
          </div>
        ) : initialLoadError ? (
          <div
            role="alert"
            className="bg-white rounded-[24px] sm:rounded-[28px] border border-red-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={22} className="mt-0.5 shrink-0 text-red-600" />
              <div>
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  {t("statusLoadErrorTitle")}
                </h3>
                <p className="mt-1 font-body text-sm text-slate-600">
                  {t("statusLoadErrorMsg")}
                </p>
                <button
                  type="button"
                  onClick={retryInitialLoad}
                  className="mt-4 rounded-xl bg-[#1D68F3] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                >
                  {t("retry")}
                </button>
              </div>
            </div>
          </div>
        ) : regWindow.shortBreak ? (
          /* Short Break Card: When Doctor Pauses Queue / Takes a Short Break */
          <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-amber-100 p-5 sm:p-6 shadow-xl shadow-amber-900/5 mb-4 text-left relative overflow-hidden">
            {/* Top Amber Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

            <div className="flex items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                  <Coffee className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    {t("shortBreakTitle")}
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-700">
                    {t("queuePausedBadge")}
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/90 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{t("onBreakBadge")}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-md shadow-orange-500/20 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-sm sm:text-base font-extrabold text-white leading-tight">
                    {t("doctorOnShortBreak")}
                  </h4>
                  <p className="font-body text-xs text-amber-100 font-medium mt-0.5 leading-relaxed">
                    {t("shortBreakMsg")}
                  </p>
                </div>
              </div>

              {/* Status summary showing last token or next token */}
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between gap-2 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">
                    {inProgress
                      ? t("currentPatientLabel")
                      : lastConsultedPatient
                      ? t("lastConsultedLabel")
                      : t("nextPatientInLine")}:
                  </span>
                  <span className="font-mono-custom text-xs font-black bg-white/25 border border-white/30 rounded-md px-2 py-0.5 text-white">
                    #{inProgress?.slot_token_number ||
                      inProgress?.token_number ||
                      lastConsultedPatient?.slot_token_number ||
                      lastConsultedPatient?.token_number ||
                      nextPatient?.slot_token_number ||
                      nextPatient?.token_number ||
                      "—"}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur-xs rounded-lg px-2 py-0.5">
                  {t("willResumeShortly")}
                </span>
              </div>
            </div>

            {/* Reassurance Notice */}
            <div className="mt-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {t("shortBreakReassurance")}
              </p>
            </div>
          </div>
        ) : inProgress ? (
          /* When doctor HAS STARTED seeing appointment patients */
          <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2.5">
                <DoctorAvatarSVG className="w-10 h-10 shrink-0" />
                <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                  {t("liveQueue")}
                </h3>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/90 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t("liveBadge")}</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-3.5 sm:p-4 text-white shadow-md shadow-blue-500/20 relative overflow-hidden">
              <p className="font-body text-[10px] sm:text-[11px] font-bold text-blue-100 uppercase tracking-widest mb-1">
                {t("doctorSeeingTitle")}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono-custom text-3xl sm:text-4xl font-black text-white leading-none shrink-0">
                    {inProgress.slot_token_number || inProgress.token_number}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {t("inConsultation")}
                  </span>
                  {inProgress.time_slot && (
                    <span className="bg-white/20 backdrop-blur-xs rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-mono-custom font-semibold text-white">
                      {tTimeSlot(inProgress.time_slot)}
                    </span>
                  )}
                </div>
              </div>

              {/* Next in Line Display */}
              <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider shrink-0">
                    ⚡ {t("nextPatientInLine")}:
                  </span>
                  {nextPatient ? (
                    <span className="font-mono-custom text-xs font-black bg-white/25 border border-white/30 rounded-md px-2 py-0.5 text-white">
                      #{nextPatient.slot_token_number || nextPatient.token_number}
                    </span>
                  ) : (
                    <span className="text-xs text-blue-200 italic font-medium">
                      {t("noPatientWaiting")}
                    </span>
                  )}
                </div>
                {nextPatient && nextPatient.time_slot && (
                  <span className="text-[10px] font-mono-custom font-semibold text-blue-100 bg-white/15 rounded px-1.5 py-0.5 shrink-0">
                    {tTimeSlot(nextPatient.time_slot)}
                  </span>
                )}
              </div>
            </div>

            {/* Priority Notice in red shade */}
            <PriorityQueueNotice className="mt-3" />
          </div>
        ) : isAppointmentListFinished && hasWaitingWalkin ? (
          /* When all appointment patients are finished, and there are walk-in patients */
          <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2.5">
                <DoctorAvatarSVG className="w-10 h-10 shrink-0" />
                <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                  {t("liveQueue")}
                </h3>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200/90 text-purple-700 px-2.5 py-1 rounded-full text-[11px] font-extrabold">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>{t("liveBadge")}</span>
              </div>
            </div>

            {/* Purple Live Queue Banner for Walk-in Patients */}
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 rounded-2xl p-3.5 sm:p-4 text-white shadow-md shadow-purple-500/25 relative overflow-hidden">
              <p className="font-body text-[10px] sm:text-[11px] font-bold text-purple-200 uppercase tracking-widest mb-1">
                {inProgressWalkin ? t("doctorSeeingTitle") : t("doctorSeeingWalkinTitle")}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono-custom text-3xl sm:text-4xl font-black text-white leading-none shrink-0">
                    {inProgressWalkin
                      ? inProgressWalkin.walkin_token_display ||
                        `W-${inProgressWalkin.token_number}`
                      : "W-IN"}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {t("inConsultation")}
                  </span>
                  <span className="bg-white/20 backdrop-blur-xs rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-mono-custom font-semibold text-white">
                    Walk-in
                  </span>
                </div>
              </div>
              {!inProgressWalkin && (
                <p className="font-body text-xs text-purple-100 font-medium leading-relaxed mt-2.5 pt-2 border-t border-white/15">
                  {t("doctorSeeingWalkinMsg")}
                </p>
              )}

              {/* Next in Line Display */}
              <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider shrink-0">
                    ⚡ {t("nextPatientInLine")}:
                  </span>
                  {nextWalkinPatient ? (
                    <span className="font-mono-custom text-xs font-black bg-white/25 border border-white/30 rounded-md px-2 py-0.5 text-white shrink-0">
                      {nextWalkinPatient.walkin_token_display ||
                        `W-${nextWalkinPatient.token_number}`}
                    </span>
                  ) : (
                    <span className="text-xs text-purple-200 italic font-medium">
                      {t("noPatientWaiting")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Priority notice in red shade */}
            <PriorityQueueNotice className="mt-3" />
          </div>
        ) : hasWaitingPatients && isDoctorVisitingToday ? (
          /* When today is appointment date with waiting patients, but doctor hasn't started yet */
          <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
            <div className="flex items-start gap-3.5 mb-2">
              <DoctorAvatarSVG className="w-11 h-11 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                  {t("doctorWillVisitTitle")}
                </h3>
                <p className="font-body text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {t("doctorNotStartedMsg")}
                </p>
              </div>
            </div>

            {/* Expected Time Pill Box */}
            <div className="w-fit max-w-full inline-flex items-center gap-2 bg-[#1D68F3] text-white rounded-xl px-3.5 py-2 text-xs font-extrabold shadow-md shadow-blue-500/25 mt-2.5 transition-all">
              <Clock size={16} className="text-white shrink-0" />
              <span className="font-extrabold text-white">
                {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)} –{" "}
                {tTime12Hour(regWindow.endTime)}
              </span>
            </div>

            {/* Priority notice in red shade */}
            <PriorityQueueNotice className="mt-3" />
          </div>
        ) : isFutureDate ? (
          /* Doctor visit scheduled on a future date */
          <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
            <div className="flex items-start gap-3.5 mb-2">
              <DoctorAvatarSVG className="w-11 h-11 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-1">
                  {t("doctorWillVisitDateTitle", { date: formattedVisitDate })}
                </h3>
              </div>
            </div>

            {/* Expected Time Pill Box */}
            <div className="w-fit max-w-full inline-flex items-center gap-2 bg-[#1D68F3] text-white rounded-xl px-3.5 py-2 text-xs font-extrabold shadow-md shadow-blue-500/25 mt-2.5 transition-all">
              <Clock size={16} className="text-white shrink-0" />
              <span className="font-extrabold text-white">
                {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)} –{" "}
                {tTime12Hour(regWindow.endTime)}
              </span>
            </div>

            {/* Priority notice in red shade */}
            <PriorityQueueNotice className="mt-3" />
          </div>
        ) : (
          /* Registration will open soon (past date or concluded session) */
          <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
            <div className="flex items-start gap-3.5 mb-2">
              <DoctorAvatarSVG className="w-11 h-11 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                  {t("registrationOpenSoonTitle")}
                </h3>
                <p className="font-body text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {t("registrationOpenSoonMsg")}
                </p>
              </div>
            </div>

            {/* Expected Time Pill Box */}
            <div className="w-fit max-w-full inline-flex items-center gap-2 bg-[#1D68F3] text-white rounded-xl px-3.5 py-2 text-xs font-extrabold shadow-md shadow-blue-500/25 mt-2.5 transition-all">
              <Clock size={16} className="text-white shrink-0" />
              <span className="font-extrabold text-white">
                {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)} –{" "}
                {tTime12Hour(regWindow.endTime)}
              </span>
            </div>
          </div>
        )}

        {/* TILE 2: "I have booked my slot, now what?" */}
        <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-blue-100/70 shadow-[0_20px_50px_-15px_rgba(29,104,243,0.08)] mb-6 text-left relative overflow-hidden p-4 sm:p-6 pb-5 sm:pb-6">
          {/* Subtle atmospheric light-blue top wave background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#F0F6FF] via-[#F8FAFC]/40 to-transparent pointer-events-none select-none" />

          {/* Top-Right Decorative Yellow Marks */}
          <div className="absolute top-7 right-5 sm:top-8 sm:right-7 flex items-center gap-1 pointer-events-none select-none">
            <span className="w-1.5 h-6 rounded-full bg-[#F5B716] rotate-[32deg] block shadow-2xs" />
            <span className="w-1.5 h-4.5 rounded-full bg-[#F5B716] rotate-[32deg] translate-y-1 block shadow-2xs" />
          </div>

          {/* Card Header (Calendar Icon + Vertical Divider + Title + Smile Swoosh) */}
          <div className="relative flex items-center gap-2.5 sm:gap-3.5 pt-1 pb-1">
            <BookedSlotCalendarSVG className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" />
            <div className="w-px h-14 bg-slate-200/90 shrink-0 mx-1 sm:mx-1.5" />
            <div className="min-w-0 pr-8 sm:pr-10">
              <h2 className="font-display text-[17px] sm:text-[22px] font-black text-[#0B1B48] tracking-tight leading-[1.18]">
                <span className="block whitespace-nowrap">{t("bookedMySlotLine1") || "I have booked my"}</span>
                <span className="block whitespace-nowrap">{t("bookedMySlotLine2") || "slot, now what?"}</span>
              </h2>
              <div className="mt-1">
                <YellowSmileSwooshSVG className="w-32 sm:w-40 h-3 text-[#F5B716]" />
              </div>
            </div>
          </div>

          {/* SECTION 1: Yellow/Golden Card ("Before leaving home...") */}
          <div className="relative mt-4 sm:mt-5 bg-gradient-to-b from-[#FEF7DE] via-[#FEF0BA] to-[#FCE69C] border border-[#F6DB80] rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-5 shadow-[0_8px_22px_-8px_rgba(245,183,22,0.22)]">
            {/* Top Row: Bulb Icon + Divider + Text */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <GlowingBulbSVG className="w-10 h-10 sm:w-11 sm:h-11 shrink-0" />
              <div className="w-px h-10 bg-[#E5C369]/60 shrink-0 mx-0.5 sm:mx-1" />
              <div className="min-w-0">
                <h3 className="font-display text-[15px] sm:text-[17px] font-black text-[#0F1D40] leading-snug">
                  {t("beforeLeavingHomeTitle") || "Before leaving home,"}
                </h3>
                <p className="font-body text-[12px] sm:text-[13.5px] font-medium text-[#1E293B] mt-0.5 leading-snug">
                  {t("beforeLeavingHomeSubtitle") || "Check how many patients are ahead of you."}
                </p>
              </div>
            </div>

            {/* Bottom Row: Search Pill */}
            <div className="mt-3.5 sm:mt-4 bg-white rounded-full p-1.5 pl-3.5 sm:pl-4.5 pr-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-[#F3E2A2]/70 flex items-center gap-2 sm:gap-2.5">
              <Phone size={19} className="text-[#0B4FD8] fill-[#0B4FD8] shrink-0" />
              <div className="w-px h-6 bg-slate-200 shrink-0" />
              <input
                type="tel"
                maxLength={10}
                className="w-full bg-transparent font-body text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none py-1.5"
                placeholder={t("enterBookingMobilePlaceholder") || "Enter booking mobile number"}
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ""))}
              />
              {searchPhone ? (
                <button
                  type="button"
                  onClick={() => setSearchPhone("")}
                  className="text-slate-400 hover:text-slate-600 p-1 mr-0.5 cursor-pointer"
                  aria-label="Clear mobile number"
                >
                  <X size={15} />
                </button>
              ) : null}
              <button
                type="button"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0B4FD8] hover:bg-[#0840B5] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-700/25 active:scale-95 transition-all cursor-pointer"
                aria-label="Search"
              >
                <Search size={20} strokeWidth={2.6} className="text-white" />
              </button>
            </div>

            {/* Search Results Display */}
            {cleanPhone.length >= 3 && (
              <div className="mt-3.5 space-y-2.5 animate-fade-in">
                {searchResults.length > 0 ? (
                  searchResults.map((patient) => {
                    const queueAhead = patients.filter((p) => p.status === "waiting");
                    const patientIdx = queueAhead.findIndex((p) => p.id === patient.id);
                    const waitingAhead = patientIdx >= 0 ? patientIdx : 0;
                    const estWaitMins = Math.max(0, Math.round(waitingAhead * 3.5));

                    let statusBadge;
                    let statusMessage;

                    if (patient.status === "in-progress") {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {t("inConsultation")}
                        </span>
                      );
                      statusMessage = t("inConsultationMsg");
                    } else if (patient.status === "waiting") {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock size={11} />
                          {t("waiting")}
                        </span>
                      );
                      statusMessage =
                        waitingAhead === 0
                          ? t("nextInLineMsg")
                          : waitingAhead === 1
                            ? t("aheadInQueueOneMsg")
                            : t("aheadInQueueManyMsg", { count: waitingAhead });
                    } else if (patient.status === "done") {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <CheckCircle2 size={11} />
                          {t("completed")}
                        </span>
                      );
                      statusMessage = t("completedMsg");
                    } else {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                          <AlertCircle size={11} />
                          {t("skipped")}
                        </span>
                      );
                      statusMessage = t("skippedMsg");
                    }

                    return (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-col gap-2 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-mono-custom text-lg font-black text-blue-700">
                              {patient.slot_token_number || patient.token_number}
                            </div>
                            <div>
                              <p className="font-body text-xs sm:text-sm font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                                {tPatientName(patient.name)}
                              </p>
                              <p className="font-mono-custom text-[11px] text-slate-500">
                                {patient.phone}{" "}
                                {patient.time_slot && (
                                  <span className="ml-1 font-semibold text-blue-600">
                                    ({tTimeSlot(patient.time_slot)})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div>{statusBadge}</div>
                        </div>

                        <div className="text-[11px] sm:text-xs font-body font-semibold text-slate-600 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100 flex items-center justify-between gap-2">
                          <span>
                            {statusMessage}{" "}
                            {doctorHasStarted && patient.status === "waiting" && (
                              <span className="font-mono-custom font-extrabold text-blue-700 ml-1">
                                ({tWaitTime(estWaitMins)})
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] font-bold text-blue-600 group-hover:underline shrink-0">
                            {t("viewTicket")} &rarr;
                          </span>
                        </div>

                        {patient.status === "waiting" && (
                          <div className="mt-1">
                            <SmartArrivalGuidance
                              waitingBefore={waitingAhead}
                              doctorHasStarted={doctorHasStarted}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : cleanPhone.length >= 10 ? (
                  <div className="bg-white rounded-2xl p-4 border border-amber-200/80 text-center shadow-xs">
                    <p className="font-body text-xs font-bold text-slate-700">
                      {t("noPatientFound")}{" "}
                      <span className="font-mono-custom font-black text-slate-900">
                        {searchPhone}
                      </span>
                    </p>
                    <p className="font-body text-[11px] text-slate-500 mt-0.5 font-medium mb-3">
                      {t("checkNumberOrBook")}
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push("/patient-registration")}
                      className="inline-flex items-center gap-1.5 bg-[#0B4FD8] hover:bg-[#0840B5] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>{t("bookSlotBtn")}</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* SECTION 2: Address Card (Soft ice-blue gradient) */}
          <div className="relative mt-3 sm:mt-3.5 bg-gradient-to-b from-[#F2F7FF] to-[#EAF2FE] border border-[#D4E4FC] rounded-[22px] sm:rounded-[24px] p-3.5 sm:p-5 shadow-[0_4px_14px_rgba(29,104,243,0.04)]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <LocationTeardropPinSVG className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <div className="w-px h-10 bg-blue-200/80 shrink-0 mx-0.5 sm:mx-1" />
              <div className="min-w-0 flex-1">
                <span className="block font-display text-[14px] sm:text-[15px] font-black text-[#0F1D40] leading-tight">
                  {t("addressSectionLabel")}
                </span>
                <p className="font-body text-[12px] sm:text-[13px] font-medium text-slate-600 leading-snug mt-0.5">
                  {t("clinicFullAddress")}
                </p>
              </div>
            </div>

            {/* Open Map Button - placed after the text */}
            <div className="mt-3 sm:mt-3.5">
              <a
                href={CLINIC_MAP_URL}
                onClick={handleClinicMapClick}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50/70 border-2 border-[#1E60E8] text-[#1E60E8] rounded-full py-2.5 px-4 shadow-xs transition-all active:scale-[0.99] font-bold text-xs sm:text-sm cursor-pointer"
                title="Open Google Maps Location"
              >
                <OpenMapFoldedSVG className="w-5 h-5 shrink-0" />
                <span>{language === "hi" ? "मैप खोलें" : "Open Map"}</span>
              </a>
            </div>
          </div>

          {/* SECTION 3: Need Help Card (Soft ice-blue gradient) */}
          <div className="relative mt-3 sm:mt-3.5 bg-gradient-to-b from-[#F2F7FF] to-[#EAF2FE] border border-[#D4E4FC] rounded-[22px] sm:rounded-[24px] p-3.5 sm:p-5 shadow-[0_4px_14px_rgba(29,104,243,0.04)]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <SupportHeadsetSVG className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
              <div className="w-px h-10 bg-blue-200/80 shrink-0 mx-0.5 sm:mx-1" />
              <div className="min-w-0 flex-1">
                <span className="block font-display text-[14px] sm:text-[15px] font-black text-[#0F1D40] leading-tight">
                  {t("needHelpTitle") || "Need Help? We're Here!"}
                </span>
                <p className="font-body text-[12px] sm:text-[13px] font-medium text-slate-600 leading-snug mt-0.5">
                  {t("needHelpSubtitle") || "Call us for any assistance."}
                </p>
              </div>
            </div>

            {/* Call Button - placed after the text */}
            <div className="mt-3 sm:mt-3.5">
              <a
                href="tel:9810807381"
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50/70 border-2 border-[#1E60E8] text-[#0B4FD8] rounded-full py-2.5 px-4 shadow-xs transition-all active:scale-[0.99] font-bold text-xs sm:text-sm cursor-pointer"
                title="Call Clinic"
              >
                <Phone size={16} className="text-[#0B4FD8] fill-[#0B4FD8] shrink-0" />
                <span className="whitespace-nowrap">
                  {t("callHelpBtn") || "Call: +91 9810807381"}
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* LOGIQUEL Ad Card */}
        <LogiquelAdCard variant="landing" />

        {/* Security / Privacy Footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium pt-3 pb-4">
          <Shield size={14} className="text-slate-400" />
          <span>{t("privacyNotice")}</span>
        </div>
      </main>

      {/* Doctor Login Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border border-slate-100 animate-slide-up relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

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
    </div>
  );
}
