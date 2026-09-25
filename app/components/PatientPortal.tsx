"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { usePatientView } from "@/lib/usePatientView";
import type { Patient, RegistrationWindow } from "@/lib/types";
import type { PatientForm } from "@/lib/api";
import Toast from "./Toast";
import LogiquelAdCard from "./LogiquelAdCard";
import {
  Stethoscope,
  ArrowLeft,
  User,
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
} from "lucide-react";
import { getTimeSlots } from "../util/timeSlot";

type Step = "home" | "form" | "success";

interface TimeSlot {
  label: string;
}

function SmartArrivalGuidance({ waitingBefore }: { waitingBefore: number }) {
  if (waitingBefore <= 2) {
    return (
      <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 text-left flex items-start gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <MapPin size={18} className="text-emerald-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-extrabold text-emerald-900">
              Please Be Present in Clinic
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-live" />
          </div>
          <p className="font-body text-xs text-emerald-700 mt-0.5 font-semibold leading-relaxed">
            Your turn is near ({waitingBefore}{" "}
            {waitingBefore === 1 ? "person" : "people"} ahead). Please remain
            inside the clinic waiting area.
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
              On Your Way — Head to Clinic
            </span>
          </div>
          <p className="font-body text-xs text-amber-700 mt-0.5 font-semibold leading-relaxed">
            Arrive within 15–20 minutes. There are {waitingBefore} people
            waiting ahead of you.
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
            Relax — You Have Time
          </span>
        </div>
        <p className="font-body text-xs text-blue-700 mt-0.5 font-semibold leading-relaxed">
          {waitingBefore} people ahead. Avoid clinic crowding — head to clinic
          when 3 people are ahead.
        </p>
      </div>
    </div>
  );
}

function formatTime12Hour(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
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

function formatDateNice(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const clean = dateStr.trim().split("T")[0];
    const parts = clean.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-body text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 block text-left">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-500 font-body text-left">
          {error}
        </p>
      )}
    </div>
  );
}

function QueueStatusBar({
  patients,
  currentToken,
  onSelectPatient,
}: {
  patients: Patient[];
  currentToken: number;
  onSelectPatient: (p: Patient) => void;
}) {
  const inProgress = patients.find((p) => p.status === "in-progress");
  const [searchPhone, setSearchPhone] = useState("");

  const cleanQuery = searchPhone.replace(/\D/g, "");

  const searchResults =
    cleanQuery.length >= 3
      ? patients.filter((p) => p.phone.replace(/\D/g, "").includes(cleanQuery))
      : [];

  return (
    <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-7 mb-6 shadow-xl shadow-blue-900/5 text-left">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
          Live Queue Status
        </h2>
      </div>

      {/* Currently Being Seen */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white mb-5 shadow-md shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <p className="font-body text-blue-100 text-xs uppercase tracking-widest font-bold mb-1.5 relative z-10">
          Doctor is seeing
        </p>
        <div className="flex items-end gap-4 relative z-10">
          <span className="font-mono-custom text-5xl sm:text-6xl font-black leading-none tracking-tight">
            {inProgress
              ? `#${inProgress.slot_token_number || inProgress.token_number}`
              : "—"}
          </span>
          {inProgress && (
            <div className="pb-1 min-w-0">
              <p className="font-body text-base font-bold text-white mb-0.5 truncate">
                {inProgress.name}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-blue-100 text-xs font-body font-semibold">
                    In consultation
                  </span>
                </div>
                {inProgress.time_slot && (
                  <span className="bg-white/20 backdrop-blur-xs rounded-md px-2 py-0.5 text-[11px] font-mono-custom font-semibold text-white">
                    {inProgress.time_slot}
                  </span>
                )}
              </div>
            </div>
          )}
          {!inProgress && (
            <p className="font-body text-blue-200 text-xs pb-1 font-semibold">
              No active patient right now
            </p>
          )}
        </div>
      </div>

      {/* Phone Search Bar */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
        <label className="font-body text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
          <Search size={14} className="text-blue-600" />
          Find Your Queue Status
        </label>
        <div className="relative">
          <Phone
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="tel"
            maxLength={10}
            className="w-full border border-slate-200 rounded-xl pl-10 pr-9 py-3 font-body text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            placeholder="Enter your 10-digit phone number"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ""))}
          />
          {searchPhone && (
            <button
              type="button"
              onClick={() => setSearchPhone("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Search Results */}
        {cleanQuery.length >= 3 && (
          <div className="mt-3 space-y-2.5">
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
                      In Consultation
                    </span>
                  );
                  statusMessage =
                    "🎉 It's your turn right now! Please enter doctor's cabin.";
                } else if (patient.status === "waiting") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock size={12} />
                      Waiting
                    </span>
                  );
                  statusMessage =
                    waitingAhead === 0
                      ? "⚡ You are next in line! Please wait nearby."
                      : `⌛ ${waitingAhead} ${waitingAhead === 1 ? "person" : "people"} ahead of you in queue.`;
                } else if (patient.status === "done") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      <CheckCircle2 size={12} />
                      Completed
                    </span>
                  );
                  statusMessage = "✅ Your consultation is completed.";
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                      <AlertCircle size={12} />
                      Skipped
                    </span>
                  );
                  statusMessage =
                    "⚠️ Your token was skipped. Please inform receptionist.";
                }

                return (
                  <div
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col gap-2 hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-mono-custom text-base font-extrabold text-blue-700">
                          #{patient.slot_token_number || patient.token_number}
                        </div>
                        <div>
                          <p className="font-body text-sm font-bold text-slate-900 leading-tight">
                            {patient.name}
                          </p>
                          <p className="font-mono-custom text-xs text-slate-500">
                            {patient.phone}{" "}
                            {patient.time_slot && (
                              <span className="ml-1 font-semibold text-blue-600">
                                ({patient.time_slot})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div>{statusBadge}</div>
                    </div>
                    <div className="text-xs font-body font-medium text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                      {statusMessage}
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
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-center">
                <p className="font-body text-xs font-semibold text-slate-600">
                  No registered patient found with phone{" "}
                  <span className="font-mono-custom font-bold text-slate-900">
                    {searchPhone}
                  </span>
                </p>
                <p className="font-body text-[11px] text-slate-400 mt-0.5 font-medium">
                  Please check the number or register below to get a token.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male" as "Male" | "Female" | "Other",
    phone: "",
    time_slot: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [TIME_SLOTS, setTIME_SLOTS] = useState<string[]>([]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.age || +form.age < 1 || +form.age > 120)
      e.age = "Enter a valid age";
    if (!form.phone || form.phone.length < 10)
      e.phone = "Enter valid 10-digit phone";
    if (!form.time_slot) e.time_slot = "Please select a time slot";
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
    } catch (e) {
      setSubmitting(false);
      alert(e instanceof Error ? e.message : "Registration failed");
    }
  };

  const fetchTimeSlot = async () => {
    try {
      const response = await fetch("/api/time-slot", {
        method: "GET",
        headers: { Content_type: "application/json" },
      });

      const result = await response.json();
      if (result?.data?.[0]) {
        const startTime = result.data[0].start_time;
        const endTime = result.data[0].end_time;
        const breakStart = "13:00";
        const breakEnd = "14:00";

        const slots = getTimeSlots(startTime, endTime, breakStart, breakEnd);
        setTIME_SLOTS(slots.map((slot: TimeSlot) => slot.label));
        if (slots.length > 0 && !form.time_slot) {
          setForm((f) => ({ ...f, time_slot: slots[0].label }));
        }
      }
    } catch (err) {
      console.error("Error fetching time slots:", err);
    }
  };

  useEffect(() => {
    fetchTimeSlot();
  }, []);

  if (!regWindow.isOpen) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <AlertCircle size={28} />
        </div>
        <h3 className="font-display text-2xl font-extrabold text-slate-900 mb-2">
          Registration Closed
        </h3>
        <p className="font-body text-sm font-medium text-slate-600 max-w-sm mx-auto leading-relaxed">
          {regWindow.message ||
            "Registration for doctor's OPD session closes automatically at 10:00 AM on visit day."}
        </p>
        <button
          onClick={onBack}
          className="mt-6 text-blue-600 font-body text-sm font-bold flex items-center justify-center gap-1.5 mx-auto hover:text-blue-800 transition-colors bg-blue-50 px-5 py-2.5 rounded-full cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up text-left">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-body text-xs font-bold mb-5 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg w-fit cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Back</span>
      </button>

      <div className="mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
          Register for OPD
        </h2>
        <p className="font-body text-xs sm:text-sm text-slate-500 font-medium">
          {regWindow.message}
          {regWindow.startTime && regWindow.endTime && (
            <span>
              {" "}
              · {formatTime12Hour(regWindow.startTime)} to{" "}
              {formatTime12Hour(regWindow.endTime)}
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Full Name" error={errors.name}>
          <div className="relative">
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className={`w-full border rounded-xl pl-11 pr-4 py-3 font-body text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.name ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"}`}
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Age" error={errors.age}>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="number"
                min={1}
                max={120}
                className={`w-full border rounded-xl pl-11 pr-4 py-3 font-body text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.age ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"}`}
                placeholder="e.g. 35"
                value={form.age}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: e.target.value }))
                }
              />
            </div>
          </Field>
          <Field label="Gender">
            <select
              className="w-full border border-slate-200 rounded-xl px-4 py-3 font-body text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium appearance-none"
              value={form.gender}
              onChange={(e) =>
                setForm((f) => ({ ...f, gender: e.target.value as any }))
              }
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>
        </div>

        <Field label="Phone Number" error={errors.phone}>
          <div className="relative">
            <Phone
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="tel"
              maxLength={10}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 font-body text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.phone ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"}`}
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  phone: e.target.value.replace(/\D/g, ""),
                }))
              }
            />
          </div>
        </Field>

        {/* Time Slot Picker */}
        <Field
          label="Select OPD Time Slot (Max 10 per slot)"
          error={errors.time_slot}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {TIME_SLOTS.map((slot) => {
              const bookedCount = patients.filter(
                (p) => p.time_slot === slot,
              ).length;
              const isFull = bookedCount >= 10;
              const isSelected = form.time_slot === slot;

              return (
                <button
                  type="button"
                  key={slot}
                  disabled={isFull}
                  onClick={() => setForm((f) => ({ ...f, time_slot: slot }))}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-bold"
                      : isFull
                        ? "border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-75"
                        : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock
                      size={14}
                      className={
                        isSelected
                          ? "text-blue-600"
                          : isFull
                            ? "text-slate-400"
                            : "text-slate-500"
                      }
                    />
                    <span className="font-mono-custom text-xs font-bold">
                      {slot}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-body font-bold px-2 py-0.5 rounded-md ${
                      isFull
                        ? "bg-red-100 text-red-700"
                        : isSelected
                          ? "bg-blue-200 text-blue-900"
                          : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {isFull ? "FULL (10/10)" : `${bookedCount}/10`}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-2xl py-3.5 font-body font-bold text-base flex items-center justify-center gap-2 transition-all mt-4 shadow-lg shadow-blue-500/25 cursor-pointer"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Registering...</span>
            </>
          ) : (
            <>
              <span>Get Token Number</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SuccessScreen({
  patient,
  patients,
  pageRef,
}: {
  patient: Patient;
  patients: Patient[];
  pageRef: React.RefObject<HTMLDivElement | null>;
}) {
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
      link.download = `medi-queue-token-${displayToken}.png`;
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
      {/* 1. Top Blue Gradient Token Card (IMAGE 1 TOP CARD) */}
      <div className="bg-gradient-to-br from-[#1E5BF6] via-[#2563EB] to-[#4F46E5] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden text-center mb-6">
        {/* Soft Glowing Ambient Arc Highlights */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-blue-400/30 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon + "Your Token Number" */}
        <div className="inline-flex items-center justify-center gap-2 text-white/90 text-xs sm:text-sm font-medium tracking-wide mb-2 relative z-10">
          <Ticket size={16} className="text-blue-200" />
          <span>Your Token Number</span>
        </div>

        {/* Token Number Display (#2) */}
        <p className="font-mono-custom text-6xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight text-white drop-shadow-md my-2 relative z-10">
          #{displayToken}
        </p>

        {/* Time Slot Glass Pill */}
        <div className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-white relative z-10 shadow-inner">
          <Clock size={15} className="text-white" />
          <span>Slot: {patient.time_slot || "10:00 AM – 11:00 AM"}</span>
        </div>

        {/* Divider Bar with central pill mark */}
        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto my-4 relative z-10" />

        {/* Message */}
        <div className="relative z-10">
          <p className="font-display font-extrabold text-white text-base sm:text-lg mb-1">
            You&apos;re almost there!
          </p>
          <p className="font-body text-blue-100/90 text-xs sm:text-sm max-w-xs mx-auto font-medium">
            Thank you for your patience. We&apos;ll be with you shortly.
          </p>
        </div>
      </div>

      {/* 2. LOGIQUEL Promotional Banner (IMAGE 1 MIDDLE CARD) */}
      <LogiquelAdCard variant="token" />

      {/* 3. Bottom Outlined Download Button & Subtext (IMAGE 1 BOTTOM) */}
      <div className="flex flex-col items-center justify-center mb-6">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="border-2 border-blue-600 hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm py-3 px-7 rounded-full flex items-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 disabled:opacity-60"
        >
          <Download size={16} />
          <span>{downloading ? "Preparing Image..." : "Download / Take Screenshot"}</span>
        </button>
        <p className="text-xs text-slate-400 font-medium mt-2.5">
          Keep this token for your reference
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

export default function PatientPortal() {
  const {
    regWindow,
    patients,
    currentToken,
    addPatient,
    toast,
    initialLoading,
  } = usePatientView();
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("home");
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(
    null,
  );

  return (
    <div
      ref={pageRef}
      className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between"
    >
      {/* Header Bar (IMAGE 1 TOP HEADER) */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 max-w-md sm:max-w-xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 text-white">
            <Stethoscope size={22} />
          </div>
          <div className="text-left">
            <h1 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              MediQueue
            </h1>
            <p className="text-xs text-slate-500 font-body font-medium leading-none">
              Patient Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full px-3 py-1 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open</span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors ml-2 cursor-pointer"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-12 flex-1">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="font-body text-slate-500 font-medium text-sm animate-pulse">
              Loading live queue data...
            </p>
          </div>
        ) : (
          step === "home" && (() => {
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const sessionDateStr = regWindow.date
              ? String(regWindow.date).split("T")[0]
              : todayStr;
            const isTodaySession = sessionDateStr === todayStr;

            return (
              <div className="animate-slide-up">
                {isTodaySession ? (
                  <QueueStatusBar
                    patients={patients}
                    currentToken={currentToken}
                    onSelectPatient={(p) => {
                      setRegisteredPatient(p);
                      setStep("success");
                    }}
                  />
                ) : (
                  <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-6 sm:p-8 mb-6 shadow-xl shadow-blue-900/5 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600">
                      <Calendar size={24} />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
                      Doctor will visit on {formatDateNice(sessionDateStr)}
                    </h2>
                    <p className="font-body text-xs sm:text-sm text-slate-600 mb-4 max-w-md mx-auto leading-relaxed font-medium">
                      OPD registration is currently active for the visit scheduled on{" "}
                      <span className="font-bold text-blue-700">
                        {formatDateNice(sessionDateStr)}
                      </span>.
                      {regWindow.startTime && (
                        <span className="block mt-1 font-semibold text-slate-500">
                          Timings: {formatTime12Hour(regWindow.startTime)} – {formatTime12Hour(regWindow.endTime)}
                        </span>
                      )}
                    </p>
                    <div className="inline-flex items-center gap-2 text-xs font-bold font-body text-blue-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                      <Clock size={14} className="text-blue-600" />
                      <span>Registration Open for {formatDateNice(sessionDateStr)}</span>
                    </div>
                  </div>
                )}

                {/* Register CTA */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <button
                    onClick={() => setStep("form")}
                    className={`rounded-2xl px-8 py-4 font-body font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                      regWindow.isOpen
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                    disabled={!regWindow.isOpen}
                  >
                    {regWindow.isOpen ? (
                      <>
                        <span>
                          {isTodaySession
                            ? "Register & Get Token"
                            : `Register for ${formatDateNice(sessionDateStr)}`}
                        </span>
                        <ChevronRight size={20} />
                      </>
                    ) : (
                      <>
                        <AlertCircle size={20} />
                        <span>Registration is Currently Closed</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()
        )}

        {step === "form" && (
          <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-6 sm:p-8 shadow-xl shadow-blue-900/5">
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
          </div>
        )}

        {step === "success" && registeredPatient && (
          <SuccessScreen
            patient={registeredPatient}
            patients={patients}
            pageRef={pageRef}
          />
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
}
