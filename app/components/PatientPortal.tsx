"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { usePatientView } from "@/lib/usePatientView";
import type { Patient, RegistrationWindow } from "@/lib/types";
import type { PatientForm } from "@/lib/api";
import Toast from "./Toast";
import LogiquelAdCard from "./LogiquelAdCard";
import LoadingScreen from "./LoadingScreen";
import {
  Stethoscope,
  ArrowLeft,
  User,
  UserPlus,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Search,
  X,
  MapPin,
  Home,
  Download,
  Ticket,
  Shield,
  Heart,
  Info,
  ExternalLink,
} from "lucide-react";
import InstallPWA from "./InstallPWA";
import DocCareLogo from "./DocCareLogo";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/lib/LanguageContext";
import { getTimeSlots, formatDelayText, shiftSlotLabel, normalizeSlotLabel } from "../util/timeSlot";
import {
  DoctorAvatarSVG,
  RegisterIllustrationSVG,
  AppointmentsFullIllustrationSVG,
  BookAppointmentIconSVG,
  TicketBadgeIconSVG,
  WalkInIconSVG,
} from "./PatientPortalIllustrations";

type Step = "home" | "form" | "success";

interface TimeSlot {
  label: string;
}

function formatTime12Hour(timeStr: string | null | undefined): string {
  if (!timeStr) return "9:00 AM";
  const clean = timeStr.trim();
  if (
    clean.toLowerCase().includes("am") ||
    clean.toLowerCase().includes("pm")
  ) {
    return clean;
  }
  const parts = clean.split(":");
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours)) return clean;
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : ":00";
    return `${hours}${minStr} ${period}`;
  }
  return clean;
}

function isDateToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return true;
  const clean = dateStr.trim().split("T")[0];
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const todayFormatted = `${y}-${m}-${d}`;
  return clean === todayFormatted;
}

function formatVisitDate(dateStr: string | null | undefined, lang: "en" | "hi" = "en"): string {
  if (!dateStr) return "";
  const clean = dateStr.trim().split("T")[0];
  const parts = clean.split("-");
  let d: Date | null = null;
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      d = new Date(year, month, day);
    }
  }
  if (!d) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) d = parsed;
  }
  if (!d) return dateStr;

  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SmartArrivalGuidance({ waitingBefore }: { waitingBefore: number }) {
  const { t } = useLanguage();
  if (waitingBefore <= 2) {
    return (
      <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 text-left flex items-start gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <MapPin size={18} className="text-emerald-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-extrabold text-emerald-900">
              {t("reachClinicNow")}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-live" />
          </div>
          <p className="font-body text-xs text-emerald-700 mt-0.5 font-semibold leading-relaxed">
            {t("reachClinicNowMsg")}
          </p>
        </div>
      </div>
    );
  }

  if (waitingBefore <= 5) {
    return (
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-left flex items-start gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <Clock size={18} className="text-amber-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-extrabold text-amber-900">
              {t("leaveHomeNow")}
            </span>
          </div>
          <p className="font-body text-xs text-amber-700 mt-0.5 font-semibold leading-relaxed">
            {t("leaveHomeNowMsg")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-4 text-left flex items-start gap-3 shadow-xs">
      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
        <Home size={18} className="text-blue-700" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-extrabold text-blue-900">
            {t("relaxAtHome")}
          </span>
        </div>
        <p className="font-body text-xs text-blue-700 mt-0.5 font-semibold leading-relaxed">
          {t("relaxAtHomeMsg")}
        </p>
      </div>
    </div>
  );
}

{/* Header Component */}
function PatientHeader({ onExit }: { onExit: () => void }) {
  const { t } = useLanguage();
  return (
    <header className="relative z-10 flex items-start justify-between px-4 sm:px-6 py-4 max-w-md sm:max-w-xl w-full mx-auto gap-2">
      <div className="flex flex-col gap-1.5">
        <DocCareLogo variant="header" subtitle={t("patientPortal")} />
        <div className="flex items-center gap-2 flex-wrap">
          <InstallPWA />
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <LanguageSelector />
        <button
          onClick={onExit}
          className="inline-flex items-center justify-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200/90 rounded-full px-3 py-1 mr-1 sm:mr-1.5 shadow-2xs transition-all cursor-pointer"
        >
          {t("exit")}
        </button>
      </div>
    </header>
  );
}

{/* Search Component inside Token Search Card */}
function CheckTokenSearchCard({
  patients,
  onSelectPatient,
  delayMinutes = 0,
}: {
  patients: Patient[];
  onSelectPatient: (p: Patient) => void;
  delayMinutes?: number;
}) {
  const { t, tTimeSlot } = useLanguage();
  const [searchPhone, setSearchPhone] = useState("");
  const cleanQuery = searchPhone.replace(/\D/g, "");

  const searchResults =
    cleanQuery.length >= 3
      ? patients.filter((p) => p.phone.replace(/\D/g, "").includes(cleanQuery))
      : [];

  return (
    <div className="bg-gradient-to-br from-[#EEF4FF] via-[#F3F7FF] to-[#EBF2FF] rounded-[24px] sm:rounded-[28px] border border-blue-100/80 p-5 sm:p-6 mb-5 text-left relative overflow-hidden shadow-xs">
      {/* Background Yellow Spark Lines Accent */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <svg viewBox="0 0 40 40" className="w-8 h-8 opacity-70">
          <path d="M20 5L20 0" stroke="#FFC629" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M30 10L35 6" stroke="#FFC629" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M35 20L40 20" stroke="#FFC629" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Header Pill */}
      <div className="flex items-center gap-2 mb-3">
        <TicketBadgeIconSVG className="w-7 h-7" />
        <span className="bg-white/90 backdrop-blur-xs border border-blue-200 text-blue-600 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full">
          {t("liveTokenStatus")}
        </span>
      </div>

      <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
        {t("checkTokenTitle")}
      </h2>
      <p className="font-body text-xs sm:text-sm text-slate-600 font-medium mb-4 max-w-sm leading-relaxed">
        {t("checkTokenSubtitle")}
      </p>

      {/* Pill Search Input Bar */}
      <div className="bg-white rounded-full p-1.5 border border-blue-200/80 shadow-sm flex items-center gap-2 relative">
        <Phone size={18} className="text-blue-500 ml-3.5 shrink-0" />
        <input
          type="tel"
          maxLength={10}
          className="w-full bg-transparent font-body text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none pr-8 py-2"
          placeholder={t("enterMobilePlaceholder")}
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ""))}
        />
        {searchPhone ? (
          <button
            type="button"
            onClick={() => setSearchPhone("")}
            className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={16} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {}}
          className="w-10 h-10 rounded-full bg-[#1E5BF6] hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Search Results */}
      {cleanQuery.length >= 3 && (
        <div className="mt-4 space-y-2.5 animate-fade-in">
          {searchResults.length > 0 ? (
            searchResults.map((patient) => {
              const waitingAhead = patients.filter(
                (p) =>
                  p.status === "waiting" &&
                  p.token_number < patient.token_number,
              ).length;

              let statusBadge;
              let statusMessage;

              if (patient.status === "in-progress") {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("inConsultation")}
                  </span>
                );
                statusMessage = t("inConsultationMsg");
              } else if (patient.status === "waiting") {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock size={12} />
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <CheckCircle2 size={12} />
                    {t("completed")}
                  </span>
                );
                statusMessage = t("completedMsg");
              } else {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    <AlertCircle size={12} />
                    {t("skipped")}
                  </span>
                );
                statusMessage = t("skippedMsg");
              }

              return (
                <div
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col gap-2.5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-mono-custom text-lg font-black text-blue-700">
                        {patient.slot_token_number || patient.token_number}
                      </div>
                      <div>
                        <p className="font-body text-sm font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {patient.name}
                        </p>
                        <p className="font-mono-custom text-xs text-slate-500">
                          {patient.phone}{" "}
                          {patient.time_slot && (
                            <span className="ml-1 font-semibold text-blue-600">
                              ({tTimeSlot(shiftSlotLabel(patient.time_slot, delayMinutes))})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div>{statusBadge}</div>
                  </div>
                  <div className="text-xs font-body font-semibold text-slate-600 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 flex items-center justify-between gap-2">
                    <span>{statusMessage}</span>
                    <span className="text-[11px] font-bold text-blue-600 hover:underline shrink-0">
                      {t("viewTicket")} &rarr;
                    </span>
                  </div>
                  {patient.status === "waiting" && (
                    <div className="mt-1">
                      <SmartArrivalGuidance waitingBefore={waitingAhead} />
                    </div>
                  )}
                </div>
              );
            })
          ) : cleanQuery.length >= 10 ? (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center">
              <p className="font-body text-xs font-bold text-slate-700">
                {t("noPatientFound")}{" "}
                <span className="font-mono-custom font-black text-slate-900">
                  {searchPhone}
                </span>
              </p>
              <p className="font-body text-[11px] text-slate-400 mt-0.5 font-medium">
                {t("checkNumberOrBook")}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

{/* IMAGE 2: Appointments Full View */}
function AppointmentsFullView({
  patients,
  onSelectPatient,
}: {
  patients: Patient[];
  onSelectPatient: (p: Patient) => void;
}) {
  const { t } = useLanguage();
  const [showWalkinNotice, setShowWalkinNotice] = useState(false);

  return (
    <div className="animate-slide-up text-center w-full max-w-md sm:max-w-xl mx-auto">
      {/* Main Full Slots Card */}
      <div className="bg-white rounded-[28px] border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-blue-900/5 mb-6 text-center">
        {/* Top Calendar Full Illustration */}
        <AppointmentsFullIllustrationSVG className="w-44 h-36 mb-2" />

        {/* Title & Subtitle */}
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D1B3E] mb-2 tracking-tight">
          {t("appointmentsFullTitle")}
        </h2>
        <p className="font-body text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed mb-6">
          {t("appointmentsFullSubtitle")}
        </p>

        {/* Priority Info Pill Box */}
        <div className="bg-[#F0F5FF] border border-blue-100/80 rounded-2xl p-4 text-left flex items-start gap-3 mb-6">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Info size={18} />
          </div>
          <div className="w-px h-8 bg-blue-200/80 shrink-0 self-center" />
          <p className="font-body text-xs sm:text-sm font-semibold text-blue-900 leading-snug self-center">
            {t("walkinNote")}
          </p>
        </div>

        {/* Section Heading */}
        <h3 className="font-display text-sm sm:text-base font-extrabold text-slate-900 text-left mb-3">
          {t("walkinGuidanceTitle")}
        </h3>

        {/* Walk-in Button Card */}
        <div
          onClick={() => setShowWalkinNotice(!showWalkinNotice)}
          className="bg-[#FFF9EE] border border-amber-200/70 hover:border-amber-300 rounded-2xl p-4 text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
        >
          <div className="flex items-center gap-3.5">
            <WalkInIconSVG className="w-11 h-11" />
            <div>
              <h4 className="font-display font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors">
                {t("walkinGuidanceTitle")}
              </h4>
              <p className="font-body text-xs text-slate-500 font-medium">
                {t("walkinGuidanceText")}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
        </div>

        {showWalkinNotice && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs font-semibold text-amber-900 animate-fade-in space-y-2">
            <p className="font-bold">{t("walkinGuidanceTitle")}</p>
            <p className="leading-relaxed text-amber-800">
              {t("walkinGuidanceText")}
            </p>
            <a
              href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer mt-1"
            >
              <MapPin size={14} />
              <span>{t("getDirectionsGoogleMaps")}</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Footer Heart Decoration inside card */}
        <div className="flex items-center justify-center gap-3 mt-8 mb-4">
          <div className="h-px w-20 bg-blue-100" />
          <Heart size={14} className="text-blue-500 fill-blue-500" />
          <div className="h-px w-20 bg-blue-100" />
        </div>

        <p className="font-body text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
          {t("thankYouPatience")}
        </p>
      </div>

      {/* Check Ticket search bar for already registered patients */}
      <CheckTokenSearchCard patients={patients} onSelectPatient={onSelectPatient} />
    </div>
  );
}

{/* IMAGE 1: OPD Registration Form */}
function RegistrationForm({
  onBack,
  onSuccess,
  regWindow,
  addPatient,
  patients,
}: {
  onBack: () => void;
  onSuccess: (p: Patient) => void;
  regWindow: RegistrationWindow;
  addPatient: (form: PatientForm) => Promise<Patient>;
  patients: Patient[];
}) {
  const { t, tDynamic, tDelay, tTimeSlot, tTime12Hour } = useLanguage();
  const initialSlots = getTimeSlots(
    regWindow.startTime || "09:00",
    regWindow.endTime || "18:00",
    "13:00",
    "14:00",
    60,
    regWindow.delayMinutes || 0
  ).map((s: TimeSlot) => s.label);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male" as "Male" | "Female" | "Other",
    phone: "",
    time_slot: initialSlots[0] || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [TIME_SLOTS, setTIME_SLOTS] = useState<string[]>(initialSlots);

  const capacity = regWindow.patientsPerHour || 10;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.age || +form.age < 1 || +form.age > 120)
      e.age = "Enter a valid age";
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      e.phone = "Enter valid 10-digit mobile number";
    } else if (patients.some((p) => p.phone.replace(/\D/g, "") === cleanPhone)) {
      e.phone =
        "This phone number is already registered for this session.";
    }
    if (!form.time_slot) e.time_slot = "Please select an OPD time slot";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    try {
      const patient = await addPatient(form);
      setSubmitting(false);
      onSuccess(patient);
    } catch (err) {
      setSubmitting(false);
      alert(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const fetchTimeSlot = async () => {
    try {
      const response = await fetch("/api/time-slot");
      const result = await response.json();
      if (result?.data?.[0]?.start_time && result?.data?.[0]?.end_time) {
        const startTime = result.data[0].start_time;
        const endTime = result.data[0].end_time;
        const breakStart = "13:00";
        const breakEnd = "14:00";

        const delayMins = result?.data?.[0]?.delay_minutes ?? regWindow.delayMinutes ?? 0;
        const slots = getTimeSlots(startTime, endTime, breakStart, breakEnd, 60, delayMins);
        const slotLabels = slots.map((slot: TimeSlot) => slot.label);
        if (slotLabels.length > 0) {
          setTIME_SLOTS(slotLabels);
          setForm((f) => ({
            ...f,
            time_slot: f.time_slot && slotLabels.includes(f.time_slot) ? f.time_slot : slotLabels[0],
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching time slots:", err);
    }
  };

  useEffect(() => {
    fetchTimeSlot();
  }, []);

  return (
    <div className="animate-slide-up text-left w-full max-w-md sm:max-w-xl mx-auto">
      {/* Top Back Pill Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 font-body text-xs font-bold mb-4 transition-colors px-3.5 py-1.5 rounded-full shadow-2xs cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>{t("backToHome")}</span>
      </button>

      {/* Screen Header Block (IMAGE 1 TOP HEADER) */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-start gap-3">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600 mt-0.5">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-0.5">
              {t("patientRegistration")}
            </h2>
            <p className="font-body text-xs sm:text-sm text-slate-500 font-semibold mb-1">
              {tDynamic(regWindow.message)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Clock size={14} className="text-slate-400" />
              <span>
                {tTime12Hour(regWindow.startTime)} – {tTime12Hour(regWindow.endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Illustration Card */}
        <RegisterIllustrationSVG className="w-24 h-24 hidden xs:flex shrink-0" />
      </div>

      {/* Form Card Container */}
      <div className="bg-white rounded-[28px] border border-slate-100/90 p-5 sm:p-7 shadow-xl shadow-blue-900/5 space-y-4">
        {/* Full Name */}
        <div>
          <label className="font-body text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User size={15} className="text-blue-600" />
            <span>{t("fullNameLabel")}</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className={`w-full border rounded-xl pl-11 pr-4 py-3 font-body text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.name ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white"}`}
              placeholder={t("fullNamePlaceholder")}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs font-bold text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Age & Gender Row */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Age */}
          <div>
            <label className="font-body text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={15} className="text-blue-600" />
              <span>{t("ageLabel")}</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="number"
                min={1}
                max={120}
                className={`w-full border rounded-xl pl-11 pr-3 py-3 font-body text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.age ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white"}`}
                placeholder={t("agePlaceholder")}
                value={form.age}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: e.target.value }))
                }
              />
            </div>
            {errors.age && (
              <p className="mt-1 text-xs font-bold text-red-500">{errors.age}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="font-body text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User size={15} className="text-blue-600" />
              <span>{t("genderLabel")}</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-slate-200 rounded-xl px-4 py-3 font-body text-sm font-semibold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
              value={form.gender}
              onChange={(e) =>
                setForm((f) => ({ ...f, gender: e.target.value as any }))
              }
            >
              <option value="Male">{t("male")}</option>
              <option value="Female">{t("female")}</option>
              <option value="Other">{t("other")}</option>
            </select>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="font-body text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Phone size={15} className="text-blue-600" />
            <span>{t("mobileNumberLabel")}</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="tel"
              maxLength={10}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 font-body text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.phone ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white"}`}
              placeholder={t("mobilePlaceholder")}
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  phone: e.target.value.replace(/\D/g, ""),
                }))
              }
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs font-bold text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Time Slot Picker */}
        <div>
          <label className="font-body text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-blue-600" />
              <span>{t("selectTimeSlot")} (Max {capacity})</span>
              <span className="text-red-500">*</span>
            </span>
            {regWindow.delayMinutes > 0 && (
              <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                +{tDelay(regWindow.delayMinutes)} {t("delayApplied")}
              </span>
            )}
          </label>
          {errors.time_slot && (
            <p className="mb-2 text-xs font-bold text-red-500">{errors.time_slot}</p>
          )}

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {TIME_SLOTS.map((slot) => {
              const bookedCount = patients.filter(
                (p) => normalizeSlotLabel(p.time_slot) === normalizeSlotLabel(slot),
              ).length;
              const isFull = bookedCount >= capacity;
              const isSelected = form.time_slot === slot;

              return (
                <button
                  type="button"
                  key={slot}
                  disabled={isFull}
                  onClick={() => setForm((f) => ({ ...f, time_slot: slot }))}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-blue-500 bg-[#F0F5FF] text-blue-900 font-extrabold shadow-2xs"
                      : isFull
                        ? "border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-75"
                        : "border-slate-200 bg-white hover:bg-slate-50/80 text-slate-900 font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom Radio Button */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock
                        size={15}
                        className={
                          isSelected ? "text-blue-600" : "text-slate-400"
                        }
                      />
                      <span className="font-body text-xs sm:text-sm">
                        {tTimeSlot(slot)}
                      </span>
                    </div>
                  </div>

                  {/* Count Pill Badge */}
                  <span
                    className={`text-xs font-body font-bold px-3 py-1 rounded-full ${
                      isFull
                        ? "bg-red-100 text-red-700"
                        : isSelected
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isFull ? `${t("fullSlotText")} (${capacity}/${capacity})` : `${bookedCount}/${capacity}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button (IMAGE 1 BUTTON) */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#1E5BF6] hover:bg-blue-700 disabled:opacity-60 text-white rounded-2xl py-3.5 font-display font-extrabold text-base flex items-center justify-center gap-2 transition-all mt-6 shadow-lg shadow-blue-500/25 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>{t("submitting")}</span>
            </>
          ) : (
            <>
              <span>{t("getOPDToken")}</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>

        {/* Security Footer Notice (IMAGE 1 FOOTER) */}
        <div className="bg-blue-50/80 border border-blue-100/80 rounded-full px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold text-blue-700 w-fit mx-auto mt-4">
          <Shield size={14} className="text-blue-600 shrink-0" />
          <span>{t("securityNotice")}</span>
        </div>
      </div>
    </div>
  );
}

{/* Token Confirmation Screen */}
function SuccessScreen({
  patient,
  patients,
  pageRef,
  delayMinutes = 0,
}: {
  patient: Patient;
  patients: Patient[];
  pageRef: React.RefObject<HTMLDivElement | null>;
  delayMinutes?: number;
}) {
  const { t, tDelay, tTimeSlot } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const displayToken = patient.slot_token_number || patient.token_number;

  const handleDownload = async () => {
    if (!pageRef.current || downloading) return;

    setDownloading(true);
    setDownloadError(false);

    try {
      const dataUrl = await toPng(pageRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `doccare-token-${displayToken}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Unable to download registration confirmation", error);
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-slide-up text-center w-full max-w-md sm:max-w-xl mx-auto">
      {/* Top Blue Token Display Card */}
      <div className="bg-gradient-to-br from-[#1E5BF6] via-[#2563EB] to-[#4F46E5] rounded-[28px] p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden text-center mb-6">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-blue-400/30 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center justify-center gap-2 text-white/90 text-xs sm:text-sm font-medium tracking-wide mb-2 relative z-10">
          <Ticket size={16} className="text-blue-200" />
          <span>{t("yourToken")}</span>
        </div>

        <p className="font-mono-custom text-6xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight text-white drop-shadow-md my-2 relative z-10">
          {displayToken}
        </p>

        <div className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-white relative z-10 shadow-inner">
          <Clock size={15} className="text-white" />
          <span>
            {t("selectTimeSlot")}: {tTimeSlot(shiftSlotLabel(patient.time_slot, delayMinutes))}
            {delayMinutes > 0 ? ` (+${tDelay(delayMinutes)})` : ""}
          </span>
        </div>

        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto my-4 relative z-10" />

        <div className="relative z-10">
          <p className="font-display font-extrabold text-white text-base sm:text-lg mb-1">
            {t("registrationSuccessful")}
          </p>
          <p className="font-body text-blue-100/90 text-xs sm:text-sm max-w-xs mx-auto font-medium">
            {t("tokenIssuedMsg")}
          </p>
        </div>
      </div>

      {/* Logiquel Banner */}
      <LogiquelAdCard variant="token" />

      {/* Download Button */}
      <div className="flex flex-col items-center justify-center mb-6">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="border-2 border-blue-600 hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm py-3 px-7 rounded-full flex items-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 disabled:opacity-60"
        >
          <Download size={16} />
          <span>{downloading ? t("downloadingToken") : t("downloadTokenCard")}</span>
        </button>
        <p className="text-xs text-slate-400 font-medium mt-2.5">
          {t("queueTrackingTip")}
        </p>
        {downloadError && (
          <p className="mt-2 text-xs font-medium text-red-500 font-body">
            Could not download the confirmation. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}

{/* Main Patient Portal Page */}
export default function PatientPortal() {
  const {
    regWindow,
    patients,
    currentToken,
    addPatient,
    toast,
    initialLoading,
  } = usePatientView();
  const { t, tDelay, tDynamic, tTime12Hour, tTimeSlot, language } = useLanguage();
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const isFormStep = searchParams?.get("step") === "form";

  const [step, setStep] = useState<Step>(isFormStep ? "form" : "home");
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);
  const [TIME_SLOTS, setTIME_SLOTS] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams?.get("step") === "form") {
      setStep("form");
    }
  }, [searchParams]);

  // Fetch slot availability to check if ALL slots are full
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch("/api/time-slot");
        const json = await res.json();
        const delayMins = json?.data?.[0]?.delay_minutes ?? regWindow.delayMinutes ?? 0;
        if (json?.data?.[0]) {
          const slots = getTimeSlots(
            json.data[0].start_time,
            json.data[0].end_time,
            "13:00",
            "14:00",
            60,
            delayMins
          );
          setTIME_SLOTS(slots.map((s: TimeSlot) => s.label));
        } else {
          const slots = getTimeSlots(
            regWindow.startTime || "09:00",
            regWindow.endTime || "18:00",
            "13:00",
            "14:00",
            60,
            delayMins
          );
          setTIME_SLOTS(slots.map((s: TimeSlot) => s.label));
        }
      } catch {
        const slots = getTimeSlots(
          regWindow.startTime || "09:00",
          regWindow.endTime || "18:00",
          "13:00",
          "14:00",
          60,
          regWindow.delayMinutes || 0
        );
        setTIME_SLOTS(slots.map((s: TimeSlot) => s.label));
      }
    };
    fetchSlots();
  }, [regWindow.startTime, regWindow.endTime]);

  const capacity = regWindow.patientsPerHour || 10;
  const allSlotsFull =
    TIME_SLOTS.length > 0 &&
    TIME_SLOTS.every(
      (slot) =>
        patients.filter(
          (p) => normalizeSlotLabel(p.time_slot) === normalizeSlotLabel(slot)
        ).length >= capacity
    );

  const inProgress = patients.find((p) => p.status === "in-progress");
  const isDoctorVisitingToday = isDateToday(regWindow.date);
  const formattedVisitDate = formatVisitDate(regWindow.date, language);

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      ref={pageRef}
      className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between"
    >
      {/* Top Header Bar */}
      <PatientHeader onExit={() => router.push("/")} />

      {/* Main Container */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-12 flex-1">
        {step === "home" && (
          allSlotsFull ? (
            /* IMAGE 2: All Slots Are Full View */
            <AppointmentsFullView
              patients={patients}
              onSelectPatient={(p) => {
                setRegisteredPatient(p);
                setStep("success");
              }}
            />
          ) : (
            /* Patient Portal Home View */
            <div className="animate-slide-up text-left space-y-4">
              {/* Doctor Delay Alert Banner */}
              {regWindow.delayMinutes > 0 && (
                <div className="bg-amber-500/10 border border-amber-300/80 rounded-[22px] p-4 text-left flex items-start gap-3 text-amber-950 shadow-xs">
                  <div className="p-2.5 bg-amber-100/90 rounded-xl shrink-0 text-amber-700 mt-0.5">
                    <Clock size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="font-display text-sm font-extrabold text-amber-950 block">
                      {t("doctorLateTitle")} (+{tDelay(regWindow.delayMinutes)})
                    </span>
                    <p className="font-body text-xs font-semibold text-amber-800 mt-0.5 leading-relaxed">
                      {t("doctorLateDesc", { delay: tDelay(regWindow.delayMinutes) })}
                    </p>
                  </div>
                </div>
              )}

              {/* CARD 1: Doctor Status Card */}
              {isDoctorVisitingToday ? (
                inProgress ? (
                  /* IMAGE 4: When doctor HAS STARTED seeing patients */
                  <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <h3 className="font-display text-base font-extrabold text-slate-900">
                        {t("liveQueue")}
                      </h3>
                      <a
                        href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 rounded-full px-2.5 sm:px-3 py-1 shadow-xs transition-all cursor-pointer shrink-0"
                        title="Clinic Location on Google Maps"
                      >
                        <MapPin size={12} className="text-emerald-600 shrink-0" />
                        <span>{t("clickForGoogleMapLocation")}</span>
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <DoctorAvatarSVG className="w-16 h-16 shrink-0" />
                      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-4 text-white shadow-md shadow-blue-500/20 flex-1 relative overflow-hidden">
                        <p className="font-body text-[11px] font-bold text-blue-100 uppercase tracking-widest mb-1">
                          {t("doctorSeeingTitle")}
                        </p>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-mono-custom text-4xl sm:text-5xl font-black text-white leading-none">
                            {inProgress.slot_token_number || inProgress.token_number}
                          </span>
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              {t("inConsultation")}
                            </span>
                            {inProgress.time_slot && (
                              <span className="bg-white/20 backdrop-blur-xs rounded-md px-2 py-0.5 text-[11px] font-mono-custom font-semibold text-white">
                                {tTimeSlot(inProgress.time_slot)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between gap-2">
                          <p className="font-body text-sm sm:text-base font-extrabold text-white truncate">
                            {inProgress.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* IMAGE 3: When today is appointment date, but doctor HAS NOT started seeing patients yet */
                  <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                      <div className="flex items-start gap-4 min-w-0">
                        <DoctorAvatarSVG className="w-16 h-16 shrink-0" />
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                            {t("doctorWillVisitTitle")}
                          </h3>
                          <p className="font-body text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                            {t("doctorNotStartedMsg")}
                          </p>
                        </div>
                      </div>
                      <a
                        href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 rounded-full px-2.5 sm:px-3 py-1 shadow-xs transition-all cursor-pointer shrink-0"
                        title="Clinic Location on Google Maps"
                      >
                        <MapPin size={12} className="text-emerald-600 shrink-0" />
                        <span>{t("clickForGoogleMapLocation")}</span>
                      </a>
                    </div>

                    {/* Expected Time Pill Box */}
                    <div className="bg-[#F0F5FF] border border-blue-100/80 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-blue-900 mt-4">
                      <Clock size={16} className="text-blue-600 shrink-0" />
                      <span>
                        {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)} – {tTime12Hour(regWindow.endTime)}
                      </span>
                    </div>
                  </div>
                )
              ) : (
                /* Doctor visit scheduled on a different date */
                <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-start gap-4 min-w-0">
                      <DoctorAvatarSVG className="w-16 h-16 shrink-0" />
                      <div>
                        <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                          {t("doctorWillVisitDateTitle", { date: formattedVisitDate })}
                        </h3>
                      </div>
                    </div>
                    <a
                      href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 rounded-full px-2.5 sm:px-3 py-1 shadow-xs transition-all cursor-pointer shrink-0"
                      title="Clinic Location on Google Maps"
                    >
                      <MapPin size={12} className="text-emerald-600 shrink-0" />
                      <span>{t("clickForGoogleMapLocation")}</span>
                    </a>
                  </div>

                  {/* Expected Time Pill Box */}
                  <div className="bg-[#F0F5FF] border border-blue-100/80 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-blue-900 mt-4">
                    <Clock size={16} className="text-blue-600 shrink-0" />
                    <span>
                      {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)} – {tTime12Hour(regWindow.endTime)}
                    </span>
                  </div>
                </div>
              )}

              {/* CARD 2: Check Your Token Number */}
              <CheckTokenSearchCard
                patients={patients}
                onSelectPatient={(p) => {
                  setRegisteredPatient(p);
                  setStep("success");
                }}
                delayMinutes={regWindow.delayMinutes}
              />

              {/* CARD 3: Book an Appointment Card */}
              <div className="bg-gradient-to-br from-[#FFFDF2] to-[#FFF9E6] rounded-[24px] sm:rounded-[28px] border border-amber-200/60 p-4 sm:p-5 text-left relative overflow-hidden shadow-xs mb-6 flex items-center justify-between gap-3 sm:gap-4">
                <BookAppointmentIconSVG className="w-11 h-11 sm:w-12 sm:h-12 shrink-0" />

                <button
                  onClick={() => {
                    if (allSlotsFull) {
                      // If slots full, stay on appointments full view
                      setStep("home");
                    } else {
                      setStep("form");
                    }
                  }}
                  className="flex-1 bg-[#FFC629] hover:bg-[#F5B813] text-slate-900 font-display font-extrabold text-sm sm:text-base rounded-2xl py-3 px-4 flex items-center justify-center gap-2 shadow-md shadow-amber-400/20 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{t("bookSlotBtn")}</span>
                  <ChevronRight size={18} className="shrink-0" />
                </button>
              </div>

              {/* Logiquel Branding Banner */}
              <LogiquelAdCard variant="landing" />

              {/* Footer Note */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium pt-2">
                <Shield size={14} className="text-slate-400" />
                <span>{t("privacyNotice")}</span>
              </div>
            </div>
          )
        )}

        {/* STEP: Registration Form (IMAGE 1) */}
        {step === "form" && (
          <RegistrationForm
            onBack={() => setStep("home")}
            onSuccess={(p) => {
              setRegisteredPatient(p);
              setStep("success");
            }}
            regWindow={regWindow}
            addPatient={addPatient}
            patients={patients}
          />
        )}

        {/* STEP: Success Ticket Confirmation */}
        {step === "success" && registeredPatient && (
          <SuccessScreen
            patient={registeredPatient}
            patients={patients}
            pageRef={pageRef}
            delayMinutes={regWindow.delayMinutes}
          />
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
}
