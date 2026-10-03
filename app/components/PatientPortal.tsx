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
  QrCode,
  Camera,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import InstallPWA from "./InstallPWA";
import DocCareLogo from "./DocCareLogo";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/lib/LanguageContext";
import {
  getTimeSlots,
  formatDelayText,
  shiftSlotLabel,
  normalizeSlotLabel,
} from "../util/timeSlot";
import {
  DoctorAvatarSVG,
  RegisterIllustrationSVG,
  AppointmentsFullIllustrationSVG,
  BookAppointmentIconSVG,
  TicketBadgeIconSVG,
  WalkInIconSVG,
} from "./PatientPortalIllustrations";

type Step = "home" | "form" | "full" | "success";

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

function parseDateOnly(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim().split("T")[0];
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(clean)) {
    const parts = clean.split(/[-/]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(clean)) {
    const parts = clean.split(/[-/]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getTodayDateOnly(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isDateToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return true;
  const target = parseDateOnly(dateStr);
  if (!target) return true;
  const today = getTodayDateOnly();
  return target.getTime() === today.getTime();
}

function isDateInFuture(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const target = parseDateOnly(dateStr);
  if (!target) return false;
  const today = getTodayDateOnly();
  return target.getTime() > today.getTime();
}

function formatVisitDate(
  dateStr: string | null | undefined,
  lang: "en" | "hi" = "en",
): string {
  if (!dateStr) return "";
  const d = parseDateOnly(dateStr);
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

{
  /* Header Component */
}
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

{
  /* Search Component inside Token Search Card */
}
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
          <path
            d="M20 5L20 0"
            stroke="#FFC629"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M30 10L35 6"
            stroke="#FFC629"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M35 20L40 20"
            stroke="#FFC629"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Header Pill */}
      <div className="flex items-center gap-2 mb-3">
        <TicketBadgeIconSVG className="w-7 h-7" />
        <span className="bg-white/90 backdrop-blur-xs border border-blue-200 text-blue-600 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full">
          {t("liveTokenStatus")}
        </span>
      </div>

      <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mb-3.5 tracking-tight">
        {t("checkTokenTitle")}
      </h2>

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
                              (
                              {tTimeSlot(
                                shiftSlotLabel(patient.time_slot, delayMinutes),
                              )}
                              )
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

{
  /* IMAGE 2: Appointments Full View */
}
function AppointmentsFullView({
  patients,
  onSelectPatient,
  onBack,
}: {
  patients: Patient[];
  onSelectPatient: (p: Patient) => void;
  onBack?: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="animate-slide-up text-center w-full max-w-md sm:max-w-xl mx-auto">
      

      {/* Main Full Slots Card */}
      <div className="bg-white rounded-[28px] border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-blue-900/5 mb-6 text-center">
        {/* Top Calendar Full Illustration */}
        <AppointmentsFullIllustrationSVG className="w-44 h-36 mb-2 -mt-8" />

        {/* Title & Subtitle */}
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D1B3E] mb-2 tracking-tight -mt-6">
          {t("appointmentsFullTitle")}
        </h2>
        <p className="font-body text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed mb-6">
          {t("appointmentsFullSubtitle")}
        </p>

        {/* Priority Info Pill Box */}
        <div className="bg-[#F0F5FF] border border-blue-100/80 rounded-2xl p-4 text-left flex items-start gap-3 mb-6 -mt-5">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Info size={18} />
          </div>
          <div className="w-px h-8 bg-blue-200/80 shrink-0 self-center" />
          <p className="font-body text-xs sm:text-sm font-semibold text-blue-900 leading-snug self-center">
            {t("walkinNote")}
          </p>
        </div>

        {/* Walk-in Guidance Card */}
        <div className="bg-[#FFF9EE] border border-amber-200/70 rounded-2xl p-3.5 sm:p-4 text-left flex items-start gap-3 shadow-2xs">
          <WalkInIconSVG className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 mt-6" />
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-extrabold text-slate-900 text-xs sm:text-sm mb-1">
              {t("walkinGuidanceTitle")}
            </h4>
            <p className="font-body text-xs text-slate-600 font-medium leading-relaxed mb-2">
              Please contact on this number regarding walk in appointment:
            </p>
            <a
              href="tel:9810807381"
              className="inline-flex items-center gap-1.5 bg-[#1D68F3] hover:bg-[#1554C6] active:scale-95 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Phone size={13} className="shrink-0" />
              <span>Call 9810807381</span>
            </a>
          </div>
        </div>

        {/* Footer Heart Decoration inside card */}
        <div className="flex items-center justify-center gap-3 mb-4 mt-4">
          <div className="h-px w-20 bg-blue-100" />
          <Heart size={14} className="text-blue-500 fill-blue-500" />
          <div className="h-px w-20 bg-blue-100" />
        </div>

        <p className="font-body text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
          {t("thankYouPatience")}
        </p>
      </div>

      {/* Logiquel Branding Footer Banner */}
      <LogiquelAdCard variant="landing" />
    </div>
  );
}

{
  /* IMAGE 1: OPD Registration Form */
}
function RegistrationForm({
  onSuccess,
  regWindow,
  addPatient,
  patients,
}: {
  onSuccess: (p: Patient) => void;
  regWindow: RegistrationWindow;
  addPatient: (form: PatientForm) => Promise<Patient>;
  patients: Patient[];
}) {
  const { t, tDynamic, tDelay, tTimeSlot, tTime12Hour } = useLanguage();
  const initialSlots = getTimeSlots(
    regWindow.startTime || "09:00",
    regWindow.endTime || "18:00",
    "14:00",
    "15:00",
    60,
    regWindow.delayMinutes || 0,
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
      e.age = "Enter a valid age (1-120)";
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      e.phone = "Enter a valid 10-digit mobile number";
    } else if (
      patients.some((p) => p.phone.replace(/\D/g, "") === cleanPhone)
    ) {
      e.phone = "This phone number is already registered for this session.";
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
        const breakStart = "14:00";
        const breakEnd = "15:00";

        const delayMins =
          result?.data?.[0]?.delay_minutes ?? regWindow.delayMinutes ?? 0;
        const slots = getTimeSlots(
          startTime,
          endTime,
          breakStart,
          breakEnd,
          60,
          delayMins,
        );
        const slotLabels = slots.map((slot: TimeSlot) => slot.label);
        if (slotLabels.length > 0) {
          setTIME_SLOTS(slotLabels);
          setForm((f) => ({
            ...f,
            time_slot:
              f.time_slot && slotLabels.includes(f.time_slot)
                ? f.time_slot
                : slotLabels[0],
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
                {tTime12Hour(regWindow.startTime)} –{" "}
                {tTime12Hour(regWindow.endTime)}
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                className={`w-full border rounded-xl pl-11 pr-3 py-3 font-body text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.age ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white"}`}
                placeholder={t("agePlaceholder")}
                value={form.age}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    age: e.target.value.replace(/\D/g, "").slice(0, 3),
                  }))
                }
              />
            </div>
            {errors.age && (
              <p className="mt-1 text-xs font-bold text-red-500">
                {errors.age}
              </p>
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
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 font-body text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.phone ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white"}`}
              placeholder={t("mobilePlaceholder")}
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs font-bold text-red-500">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Time Slot Picker */}
        <div>
          <label className="font-body text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-blue-600" />
              <span>
                {t("selectTimeSlot")} (Max {capacity})
              </span>
              <span className="text-red-500">*</span>
            </span>
            {regWindow.delayMinutes > 0 && (
              <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                +{tDelay(regWindow.delayMinutes)} {t("delayApplied")}
              </span>
            )}
          </label>
          {errors.time_slot && (
            <p className="mb-2 text-xs font-bold text-red-500">
              {errors.time_slot}
            </p>
          )}

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {TIME_SLOTS.map((slot) => {
              const bookedCount = patients.filter(
                (p) =>
                  normalizeSlotLabel(p.time_slot) === normalizeSlotLabel(slot),
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
                    {isFull
                      ? `${t("fullSlotText")} (${capacity}/${capacity})`
                      : `${bookedCount}/${capacity}`}
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

{
  /* Token Confirmation Screen */
}
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
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const UPI_ID = "sriji70007849@barodampay";
  const MERCHANT_NAME = "SRI JI SEVA SANSTHAN";

  const handleCopyUpi = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(UPI_ID);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = UPI_ID;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch (err) {
      console.error("Failed to copy UPI ID:", err);
    }
  };

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
      {/* Compact Token Display Card */}
      <div className="bg-gradient-to-br from-[#1E5BF6] to-[#2563EB] rounded-2xl p-4 sm:p-5 text-white shadow-md shadow-blue-500/20 relative overflow-hidden text-center mb-4">
        {/* Token number */}
        <div className="flex flex-col items-center justify-center gap-1 py-0.5">
          <span className="text-[11px] font-bold text-blue-100 uppercase tracking-widest">
            {t("yourToken")}
          </span>
          <span className="font-mono-custom text-4xl sm:text-5xl font-black leading-none text-white drop-shadow-sm">
            {displayToken}
          </span>
        </div>

        {/* Time slot */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs border border-white/25 rounded-full px-3 py-1 text-xs font-semibold text-white">
          <Clock size={13} className="shrink-0" />
          <span>
            {tTimeSlot(shiftSlotLabel(patient.time_slot, delayMinutes))}
            {delayMinutes > 0 ? ` (+${tDelay(delayMinutes)})` : ""}
          </span>
        </div>

        {/* Success message at last */}
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-200 mt-2.5">
          <CheckCircle2 size={15} className="text-emerald-300 shrink-0" />
          <span>{t("registrationSuccessful")}</span>
        </div>
      </div>

      {/* Payment UPI Card */}
      <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-xl shadow-blue-900/5 mb-5 text-center overflow-hidden relative">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide mb-3.5">
          <QrCode size={14} className="text-blue-600 shrink-0" />
          <span>{t("scanToPayTitle")}</span>
        </div>

        {/* UPI ID Display Box */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 mb-3.5 text-center max-w-sm mx-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {MERCHANT_NAME}
          </span>
          <span className="font-mono-custom text-xs sm:text-sm font-extrabold text-slate-800 break-all block mt-0.5">
            {UPI_ID}
          </span>
        </div>

        {/* 2 Action Buttons: View QR Code + Copy UPI ID */}
        <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto mb-3.5">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 border border-blue-200/90 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <QrCode size={16} className="text-blue-600 shrink-0" />
            <span className="truncate">{t("viewQrCodeBtn")}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyUpi}
            className={`font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
              copiedUpi
                ? "bg-emerald-600 text-white border border-emerald-600"
                : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-900"
            }`}
          >
            {copiedUpi ? (
              <>
                <Check size={16} className="text-white shrink-0" />
                <span>{t("upiIdCopied")}</span>
              </>
            ) : (
              <>
                <Copy size={15} className="shrink-0" />
                <span className="truncate">{t("copyUpiIdBtn")}</span>
              </>
            )}
          </button>
        </div>

        {/* Screenshot Saving Guidance Notice */}
        <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 text-left flex items-start gap-2 max-w-sm mx-auto">
          <Camera size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="font-body text-[11px] sm:text-xs font-semibold text-amber-900 leading-relaxed">
            {t("savePaymentScreenshotNotice")}
          </p>
        </div>
      </div>

      {/* QR Code Popup Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-10 sm:pt-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-[28px] max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-center relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-left min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <QrCode size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-sm text-slate-900 leading-tight truncate">
                    {t("scanToPayTitle")}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {MERCHANT_NAME}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* QR Code Image */}
            <div className="bg-gradient-to-b from-orange-50/60 to-amber-50/40 border border-orange-100/90 rounded-2xl p-3.5 mb-3.5 shadow-inner">
              <img
                src="/payment-qr.png"
                alt="Payment QR Code"
                className="w-56 h-56 object-contain mx-auto rounded-xl bg-white p-2 shadow-xs border border-slate-200/80"
              />
              <p className="font-mono-custom text-xs font-bold text-slate-800 mt-2 break-all">
                {UPI_ID}
              </p>
            </div>

            {/* Copy Button inside Modal */}
            <button
              type="button"
              onClick={handleCopyUpi}
              className={`w-full font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer mb-2.5 shadow-2xs active:scale-95 ${
                copiedUpi
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {copiedUpi ? (
                <>
                  <Check size={15} />
                  <span>{t("upiIdCopied")}</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>{t("copyUpiIdBtn")}</span>
                </>
              )}
            </button>

            {/* Note */}
            <p className="text-[11px] text-amber-800 font-medium bg-amber-50 rounded-lg p-2 leading-relaxed">
              {t("savePaymentScreenshotNotice")}
            </p>
          </div>
        </div>
      )}

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
          <span>
            {downloading ? t("downloadingToken") : t("downloadTokenCard")}
          </span>
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

{
  /* Main Patient Portal Page */
}
export default function PatientPortal() {
  const {
    regWindow,
    patients,
    currentToken,
    addPatient,
    toast,
    initialLoading,
    initialLoadError,
    retryInitialLoad,
  } = usePatientView();
  const { t, tDelay, tDynamic, tTime12Hour, tTimeSlot, language } =
    useLanguage();
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const isFormStep = searchParams?.get("step") === "form";

  const [step, setStep] = useState<Step>(isFormStep ? "form" : "home");
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(
    null,
  );
  const [TIME_SLOTS, setTIME_SLOTS] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams?.get("step") === "form") {
      setStep("form");
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Fetch slot availability to check if ALL slots are full
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch("/api/time-slot");
        const json = await res.json();
        const delayMins =
          json?.data?.[0]?.delay_minutes ?? regWindow.delayMinutes ?? 0;
        if (json?.data?.[0]) {
          const slots = getTimeSlots(
            json.data[0].start_time,
            json.data[0].end_time,
            "14:00",
            "15:00",
            60,
            delayMins,
          );
          setTIME_SLOTS(slots.map((s: TimeSlot) => s.label));
        } else {
          const slots = getTimeSlots(
            regWindow.startTime || "09:00",
            regWindow.endTime || "18:00",
            "14:00",
            "15:00",
            60,
            delayMins,
          );
          setTIME_SLOTS(slots.map((s: TimeSlot) => s.label));
        }
      } catch {
        const slots = getTimeSlots(
          regWindow.startTime || "09:00",
          regWindow.endTime || "18:00",
          "14:00",
          "15:00",
          60,
          regWindow.delayMinutes || 0,
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
          (p) => normalizeSlotLabel(p.time_slot) === normalizeSlotLabel(slot),
        ).length >= capacity,
    );

  const inProgress = patients.find(
    (p) => p.status === "in-progress" || (p.status as string) === "in_progress",
  );
  const waitingPatients = patients.filter((p) => p.status === "waiting");
  const hasWaitingPatients = waitingPatients.length > 0;
  const allPatientsDone =
    patients.length > 0 &&
    patients.every((p) => p.status === "done" || p.status === "skipped");
  const isDoctorVisitingToday = isDateToday(regWindow.date);
  const isFutureDate = isDateInFuture(regWindow.date);
  const formattedVisitDate = formatVisitDate(regWindow.date, language);

  return (
    <div
      ref={pageRef}
      className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between"
    >
      {/* Top Header Bar */}
      <PatientHeader
        onExit={() => {
          if (step !== "home") {
            setStep("home");
          } else {
            router.push("/");
          }
        }}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-12 flex-1">
        {step === "home" && (
          /* Patient Portal Home View */
          <div className="animate-slide-up text-left space-y-4">
            {/* Doctor Delay Alert Banner */}
            {!initialLoading && regWindow.delayMinutes > 0 && (
              <div className="bg-amber-500/10 border border-amber-300/80 rounded-[22px] p-4 text-left flex items-start gap-3 text-amber-950 shadow-xs">
                <div className="p-2.5 bg-amber-100/90 rounded-xl shrink-0 text-amber-700 mt-0.5">
                  <Clock size={18} className="animate-pulse" />
                </div>
                <div>
                  <span className="font-display text-sm font-extrabold text-amber-950 block">
                    {t("doctorLateTitle")} (+{tDelay(regWindow.delayMinutes)})
                  </span>
                  <p className="font-body text-xs font-semibold text-amber-800 mt-0.5 leading-relaxed">
                    {t("doctorLateDesc", {
                      delay: tDelay(regWindow.delayMinutes),
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* CARD 1: Doctor Status Card */}
            {initialLoading ? (
              /* Card Loader while deciding registration / doctor status */
              <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
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
                  <a
                    href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full min-w-0 items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 active:scale-95 border border-orange-200/90 rounded-xl px-3 py-1.5 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer ml-auto"
                    title="Clinic Location on Google Maps"
                  >
                    <MapPin size={13} className="text-orange-600 shrink-0" />
                    <span className="min-w-0 truncate">{t("googleMapLocation")}</span>
                  </a>
                </div>

                {/* Clinic Address Skeleton */}
                <a
                  href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs font-bold text-emerald-800 mt-4 transition-all group cursor-pointer shadow-2xs"
                  title="Open Clinic Address on Google Maps"
                >
                  <MapPin size={15} className="text-emerald-600 shrink-0" />
                  <span className="font-extrabold text-emerald-950">
                    {t("clinicAddress")}
                  </span>
                </a>

                {/* Status Bar Loader */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-extrabold shadow-md shadow-blue-500/25 mt-2.5 transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <Loader2
                      size={15}
                      className="text-white shrink-0 animate-spin"
                    />
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
                  <AlertCircle
                    size={22}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
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
            ) : inProgress ? (
              /* When doctor HAS STARTED seeing patients */
              <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
                <div className="flex flex-nowrap items-center justify-between gap-1.5 sm:gap-3 mb-3.5">
                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
                    <DoctorAvatarSVG className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
                    <h3 className="truncate font-display text-sm sm:text-lg font-extrabold text-slate-900">
                      {t("liveQueue")}
                    </h3>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-w-0 shrink items-center gap-1 px-2 py-1.5 text-[10px] sm:gap-1.5 sm:px-3 sm:text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 active:scale-95 border border-orange-200/90 rounded-xl shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                    title="Clinic Location on Google Maps"
                  >
                    <MapPin size={13} className="text-orange-600 shrink-0" />
                    <span className="min-w-0 truncate">{t("googleMapLocation")}</span>
                  </a>
                </div>

                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-3.5 sm:p-4 text-white shadow-md shadow-blue-500/20 relative overflow-hidden">
                  <p className="font-body text-[10px] sm:text-[11px] font-bold text-blue-100 uppercase tracking-widest mb-1">
                    {t("doctorSeeingTitle")}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono-custom text-3xl sm:text-4xl font-black text-white leading-none shrink-0">
                        {inProgress.slot_token_number ||
                          inProgress.token_number}
                      </span>
                      <span className="font-body text-sm sm:text-base font-extrabold text-white truncate">
                        {inProgress.name}
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
                </div>
              </div>
            ) : allPatientsDone ? (
              /* When doctor has finished seeing all patients — always show Registration will open soon */
              <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex items-start gap-4 min-w-0">
                    <DoctorAvatarSVG className="w-16 h-16 shrink-0" />
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                        {t("registrationOpenSoonTitle")}
                      </h3>
                      <p className="font-body text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {t("registrationOpenSoonMsg")}
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full min-w-0 items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 active:scale-95 border border-orange-200/90 rounded-xl px-3 py-1.5 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                    title="Clinic Location on Google Maps"
                  >
                    <MapPin size={13} className="text-orange-600 shrink-0" />
                    <span className="min-w-0 truncate">{t("googleMapLocation")}</span>
                  </a>
                </div>

                {/* Clinic Address */}
                <a
                  href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs font-bold text-emerald-800 mt-4 transition-all group cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                  title="Open Clinic Address on Google Maps"
                >
                  <MapPin
                    size={15}
                    className="text-emerald-600 shrink-0 group-hover:scale-110 transition-transform"
                  />
                  <span className="font-extrabold text-emerald-950">
                    {t("clinicAddress")}
                  </span>
                </a>

                {/* Expected Time Pill Box */}
                <div className="bg-[#1D68F3] text-white rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-extrabold shadow-md shadow-blue-500/25 mt-2.5 transition-all">
                  <Clock size={16} className="text-white shrink-0" />
                  <span className="font-extrabold text-white">
                    {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)}{" "}
                    – {tTime12Hour(regWindow.endTime)}
                  </span>
                </div>
              </div>
            ) : hasWaitingPatients && isDoctorVisitingToday ? (
              /* When today is appointment date with waiting patients, but doctor HAS NOT started seeing patients yet */
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
                    className="inline-flex max-w-full min-w-0 items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 active:scale-95 border border-orange-200/90 rounded-xl px-3 py-1.5 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                    title="Clinic Location on Google Maps"
                  >
                    <MapPin size={13} className="text-orange-600 shrink-0" />
                    <span className="min-w-0 truncate">{t("googleMapLocation")}</span>
                  </a>
                </div>

                {/* Clinic Address */}
                <a
                  href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs font-bold text-emerald-800 mt-4 transition-all group cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                  title="Open Clinic Address on Google Maps"
                >
                  <MapPin
                    size={15}
                    className="text-emerald-600 shrink-0 group-hover:scale-110 transition-transform"
                  />
                  <span className="font-extrabold text-emerald-950">
                    {t("clinicAddress")}
                  </span>
                </a>

                {/* Expected Time Pill Box */}
                <div className="bg-[#1D68F3] text-white rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-extrabold shadow-md shadow-blue-500/25 mt-2.5 transition-all">
                  <Clock size={16} className="text-white shrink-0" />
                  <span className="font-extrabold text-white">
                    {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)}{" "}
                    – {tTime12Hour(regWindow.endTime)}
                  </span>
                </div>
              </div>
            ) : isFutureDate ? (
              /* Doctor visit scheduled on a future date */
              <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex items-start gap-4 min-w-0">
                    <DoctorAvatarSVG className="w-16 h-16 shrink-0" />
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                        {t("doctorWillVisitDateTitle", {
                          date: formattedVisitDate,
                        })}
                      </h3>
                    </div>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full min-w-0 items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 active:scale-95 border border-orange-200/90 rounded-xl px-3 py-1.5 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                    title="Clinic Location on Google Maps"
                  >
                    <MapPin size={13} className="text-orange-600 shrink-0" />
                    <span className="min-w-0 truncate">{t("googleMapLocation")}</span>
                  </a>
                </div>

                {/* Clinic Address */}
                <a
                  href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs font-bold text-emerald-800 mt-4 transition-all group cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                  title="Open Clinic Address on Google Maps"
                >
                  <MapPin
                    size={15}
                    className="text-emerald-600 shrink-0 group-hover:scale-110 transition-transform"
                  />
                  <span className="font-extrabold text-emerald-950">
                    {t("clinicAddress")}
                  </span>
                </a>

                {/* Expected Time Pill Box */}
                <div className="bg-[#1D68F3] text-white rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-extrabold shadow-md shadow-blue-500/25 mt-2.5 transition-all">
                  <Clock size={16} className="text-white shrink-0" />
                  <span className="font-extrabold text-white">
                    {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)}{" "}
                    – {tTime12Hour(regWindow.endTime)}
                  </span>
                </div>
              </div>
            ) : (
              /* Registration will open soon (past date or concluded session) */
              <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5 mb-4 text-left">
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex items-start gap-4 min-w-0">
                    <DoctorAvatarSVG className="w-16 h-16 shrink-0" />
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                        {t("registrationOpenSoonTitle")}
                      </h3>
                      <p className="font-body text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {t("registrationOpenSoonMsg")}
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full min-w-0 items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 active:scale-95 border border-orange-200/90 rounded-xl px-3 py-1.5 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                    title="Clinic Location on Google Maps"
                  >
                    <MapPin size={13} className="text-orange-600 shrink-0" />
                    <span className="min-w-0 truncate">{t("googleMapLocation")}</span>
                  </a>
                </div>

                {/* Clinic Address */}
                <a
                  href="https://maps.app.goo.gl/AwEAg9eNPWjiCwJj9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs font-bold text-emerald-800 mt-4 transition-all group cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                  title="Open Clinic Address on Google Maps"
                >
                  <MapPin
                    size={15}
                    className="text-emerald-600 shrink-0 group-hover:scale-110 transition-transform"
                  />
                  <span className="font-extrabold text-emerald-950">
                    {t("clinicAddress")}
                  </span>
                </a>

                {/* Expected Time Pill Box */}
                <div className="bg-[#1D68F3] text-white rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-extrabold shadow-md shadow-blue-500/25 mt-2.5 transition-all">
                  <Clock size={16} className="text-white shrink-0" />
                  <span className="font-extrabold text-white">
                    {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)}{" "}
                    – {tTime12Hour(regWindow.endTime)}
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
                    setStep("full");
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
        )}

        {/* STEP: Appointments Full View (IMAGE 2) */}
        {step === "full" && (
          <AppointmentsFullView
            patients={patients}
            onBack={() => setStep("home")}
            onSelectPatient={(p) => {
              setRegisteredPatient(p);
              setStep("success");
            }}
          />
        )}

        {/* STEP: Registration Form (IMAGE 1) */}
        {step === "form" && (
          <RegistrationForm
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
