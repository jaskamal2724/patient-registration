"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePatientView } from "@/lib/usePatientView";
import type { Patient, RegistrationWindow } from "@/lib/types";
import type { PatientForm } from "@/lib/api";
import Toast from "./Toast";
import LogiquelLogo from "./LogiquelLogo";
import {
  Stethoscope,
  ArrowLeft,
  User,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Activity,
  AlertCircle,
  ChevronRight,
  Hash,
  Search,
  X,
  MapPin,
  Home,
} from "lucide-react";

type Step = "home" | "form" | "success";

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
            Your turn is near ({waitingBefore} {waitingBefore === 1 ? "person" : "people"} ahead). Please remain inside the clinic waiting area.
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
            Arrive within 15–20 minutes. There are {waitingBefore} people waiting ahead of you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-50/90 border border-brand-200/80 rounded-2xl p-4 text-left flex items-start gap-3 shadow-xs">
      <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
        <Home size={18} className="text-brand-700" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-extrabold text-brand-900">
            Relax — You Have Time
          </span>
        </div>
        <p className="font-body text-xs text-brand-700 mt-0.5 font-semibold leading-relaxed">
          {waitingBefore} people ahead. Avoid clinic crowding — head to clinic when 3 people are ahead.
        </p>
      </div>
    </div>
  );
}

function formatTime12Hour(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  const clean = timeStr.trim();
  if (clean.toLowerCase().includes("am") || clean.toLowerCase().includes("pm")) {
    return clean;
  }
  const parts = clean.split(":");
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours)) return clean;
    const period = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : "";
    return `${hours}${minStr} ${period}`;
  }
  return clean;
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
      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500 font-body">
          {error}
        </p>
      )}
    </div>
  );
}

function QueueStatusBar({
  patients,
  currentToken,
}: {
  patients: Patient[];
  currentToken: number;
}) {
  const waiting = patients.filter((p) => p.status === "waiting").length;
  const inProgress = patients.find((p) => p.status === "in-progress");
  const total = patients.length;

  const [searchPhone, setSearchPhone] = useState("");

  const cleanQuery = searchPhone.replace(/\D/g, "");

  const searchResults =
    cleanQuery.length >= 3
      ? patients.filter((p) => p.phone.replace(/\D/g, "").includes(cleanQuery))
      : [];

  return (
    <div className="glass-card rounded-3xl border border-surface-200 p-5 sm:p-8 mb-8 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-bold text-surface-900">
          Live Queue Status
        </h2>
      </div>

      {/* Currently Being Seen */}
      <div className="number-display rounded-2xl p-6 sm:p-8 text-white mb-6 queue-number-active shadow-lg shadow-brand-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
        <p className="font-body text-brand-100 text-xs uppercase tracking-widest font-semibold mb-2 relative z-10">
          Doctor is seeing
        </p>
        <div className="flex items-end gap-4 relative z-10">
          <span className="font-mono-custom text-5xl sm:text-7xl font-extrabold leading-none tracking-tight">
            {inProgress ? `#${inProgress.slot_token_number || inProgress.token_number}` : "—"}
          </span>
          {inProgress && (
            <div className="pb-1.5 min-w-0">
              <p className="font-body text-base sm:text-lg font-bold text-white mb-0.5 truncate">
                {inProgress.name}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-300 status-live" />
                  <span className="text-brand-100 text-xs font-body font-medium">
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
            <p className="font-body text-brand-200 text-sm pb-1.5 font-medium">
              No active patient
            </p>
          )}
        </div>
      </div>

      {/* Phone Search Bar */}
      <div className="bg-surface-50/80 rounded-2xl p-4 sm:p-5 border border-surface-200/80">
        <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
          <Search size={14} className="text-brand-600" />
          Find Your Queue Status
        </label>
        <div className="relative">
          <Phone
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="tel"
            maxLength={10}
            className="w-full border border-surface-200 rounded-xl pl-10 pr-9 py-3 font-body text-sm text-surface-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-xs"
            placeholder="Enter your 10-digit phone number"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ""))}
          />
          {searchPhone && (
            <button
              type="button"
              onClick={() => setSearchPhone("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-0.5 rounded-full hover:bg-surface-100 transition-colors"
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-live" />
                      In Consultation
                    </span>
                  );
                  statusMessage =
                    "🎉 It's your turn right now! Please enter doctor's cabin.";
                } else if (patient.status === "waiting") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      <CheckCircle2 size={12} />
                      Completed
                    </span>
                  );
                  statusMessage = "✅ Your consultation is completed.";
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
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
                    className="bg-white rounded-xl p-3.5 border border-surface-200 shadow-sm flex flex-col gap-2 animate-fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center font-mono-custom text-base font-extrabold text-brand-700">
                          #{patient.slot_token_number || patient.token_number}
                        </div>
                        <div>
                          <p className="font-body text-sm font-bold text-surface-900 leading-tight">
                            {patient.name}
                          </p>
                          <p className="font-mono-custom text-xs text-surface-500">
                            {patient.phone} {patient.time_slot && <span className="ml-1 font-semibold text-brand-600">({patient.time_slot})</span>}
                          </p>
                        </div>
                      </div>
                      <div>{statusBadge}</div>
                    </div>
                    <div className="text-xs font-body font-medium text-surface-600 bg-surface-50 rounded-lg px-3 py-2 border border-surface-100">
                      {statusMessage}
                    </div>
                    {patient.status === "waiting" && (
                      <div className="mt-1">
                        <SmartArrivalGuidance
                          waitingBefore={
                            patients.filter(
                              (p) =>
                                p.status === "waiting" &&
                                p.token_number < patient.token_number,
                            ).length
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : cleanQuery.length >= 10 ? (
              <div className="bg-white rounded-xl p-3.5 border border-surface-200 text-center animate-fade-in">
                <p className="font-body text-xs font-semibold text-surface-600">
                  No registered patient found with phone{" "}
                  <span className="font-mono-custom font-bold text-surface-900">
                    {searchPhone}
                  </span>
                </p>
                <p className="font-body text-[11px] text-surface-400 mt-0.5">
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

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
];

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

  if (!regWindow.isOpen) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={28} className="text-surface-400" />
        </div>
        <h3 className="font-display text-2xl font-bold text-surface-900 mb-2">
          Registration Closed
        </h3>
        <p className="font-body text-base font-semibold text-surface-600 max-w-sm mx-auto leading-relaxed">
          {regWindow.message || "Registration for doctor's OPD session closes automatically at 10:00 AM on visit day."}
        </p>
        <button
          onClick={onBack}
          className="mt-8 text-brand-600 font-body text-sm font-semibold flex items-center justify-center gap-1.5 mx-auto hover:text-brand-800 transition-colors bg-brand-50 px-5 py-2.5 rounded-full"
        >
          <ArrowLeft size={14} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-surface-500 hover:text-surface-900 font-body text-sm font-medium mb-6 transition-colors bg-surface-50 hover:bg-surface-100 px-3 py-1.5 rounded-lg w-fit"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <div className="mb-8">
        <h2 className="font-display text-3xl font-extrabold text-surface-900 mb-2 tracking-tight">
          Register for OPD
        </h2>
        <p className="font-body text-sm text-surface-500 font-medium">
          {regWindow.message}
          {regWindow.startTime && regWindow.endTime && (
            <span> · {formatTime12Hour(regWindow.startTime)} to {formatTime12Hour(regWindow.endTime)}</span>
          )}
        </p>
      </div>

      <div className="space-y-5">
        <Field label="Full Name" error={errors.name}>
          <div className="relative">
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
            />
            <input
              className={`input-field w-full border rounded-xl pl-11 pr-4 py-3.5 font-body text-sm transition-all shadow-sm ${errors.name ? "border-red-300 bg-red-50 text-red-900" : "border-surface-200 bg-surface-50 text-surface-900 focus:bg-white"}`}
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Age" error={errors.age}>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
              />
              <input
                type="number"
                min={1}
                max={120}
                className={`input-field w-full border rounded-xl pl-11 pr-4 py-3.5 font-body text-sm transition-all shadow-sm ${errors.age ? "border-red-300 bg-red-50 text-red-900" : "border-surface-200 bg-surface-50 text-surface-900 focus:bg-white"}`}
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
              className="input-field w-full border border-surface-200 rounded-xl px-4 py-3.5 font-body text-sm text-surface-900 bg-surface-50 focus:bg-white transition-all appearance-none shadow-sm font-medium"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
            />
            <input
              type="tel"
              maxLength={10}
              className={`input-field w-full border rounded-xl pl-11 pr-4 py-3.5 font-body text-sm transition-all shadow-sm ${errors.phone ? "border-red-300 bg-red-50 text-red-900" : "border-surface-200 bg-surface-50 text-surface-900 focus:bg-white"}`}
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
        <Field label="Select OPD Time Slot (Max 10 per slot)" error={errors.time_slot}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {TIME_SLOTS.map((slot) => {
              const bookedCount = patients.filter((p) => p.time_slot === slot).length;
              const isFull = bookedCount >= 10;
              const isSelected = form.time_slot === slot;

              return (
                <button
                  type="button"
                  key={slot}
                  disabled={isFull}
                  onClick={() => setForm((f) => ({ ...f, time_slot: slot }))}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? "border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20 shadow-xs"
                      : isFull
                        ? "border-surface-200 bg-surface-100/70 text-surface-400 cursor-not-allowed opacity-75"
                        : "border-surface-200 bg-surface-50 hover:bg-white hover:border-surface-300 text-surface-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock
                      size={15}
                      className={
                        isSelected
                          ? "text-brand-600"
                          : isFull
                            ? "text-surface-400"
                            : "text-surface-500"
                      }
                    />
                    <span className="font-mono-custom text-xs font-bold">{slot}</span>
                  </div>
                  <span
                    className={`text-[11px] font-body font-semibold px-2 py-0.5 rounded-md ${
                      isFull
                        ? "bg-red-100 text-red-700 font-bold"
                        : isSelected
                          ? "bg-brand-200 text-brand-900 font-bold"
                          : "bg-surface-200/80 text-surface-600"
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
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-2xl py-4 font-body font-bold text-base flex items-center justify-center gap-2 transition-all mt-4 shadow-lg shadow-brand-500/25"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
              Registering...
            </>
          ) : (
            <>
              Get Token Number
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
  onBack,
  patients,
}: {
  patient: Patient;
  onBack: () => void;
  patients: Patient[];
}) {
  const waitingBefore = patients.filter(
    (p) => p.status === "waiting" && p.token_number < patient.token_number,
  ).length;

  const displayToken = patient.slot_token_number || patient.token_number;

  return (
    <div className="text-center py-6 animate-slide-up">
      {/* Confetti-like dots */}
      <div className="relative inline-block mb-8">
        <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-brand-400 shadow-sm"
            style={{
              top: `${20 + 40 * Math.sin((i * 60 * Math.PI) / 180)}%`,
              left: `${50 + 60 * Math.cos((i * 60 * Math.PI) / 180)}%`,
              opacity: 0.8,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <h2 className="font-display text-4xl font-extrabold text-surface-900 mb-2 tracking-tight">
        You're Registered!
      </h2>
      <p className="font-body text-surface-500 font-medium text-sm mb-10">
        Your token number has been assigned successfully.
      </p>

      {/* Token card */}
      <div className="number-display rounded-3xl p-8 sm:p-10 text-white max-w-sm mx-auto mb-8 shadow-xl shadow-brand-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
          <Hash size={18} className="text-brand-200" />
          <span className="font-body text-brand-100 text-xs font-semibold uppercase tracking-widest">
            Your Token Number
          </span>
        </div>
        <p className="font-mono-custom text-6xl sm:text-8xl font-extrabold leading-none queue-number-active relative z-10">
          #{displayToken}
        </p>
        <p className="font-body text-white font-bold text-lg mt-4 relative z-10">
          {patient.name}
        </p>
        {patient.time_slot && (
          <div className="mt-3 inline-block bg-white/20 backdrop-blur-xs rounded-full px-4 py-1 text-xs font-mono-custom font-semibold text-white relative z-10">
            Slot: {patient.time_slot}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-surface-50 rounded-2xl border border-surface-200 p-6 max-w-sm mx-auto mb-8 text-left shadow-sm">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-surface-200/50">
            <span className="font-body text-sm font-semibold text-surface-500">
              Registered at
            </span>
            <span className="font-mono-custom text-sm font-bold text-surface-900">
              {new Date(patient.registered_at).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-surface-200/50">
            <span className="font-body text-sm font-semibold text-surface-500">
              People before you
            </span>
            <span className="font-mono-custom text-sm font-bold text-amber-600">
              {waitingBefore} waiting
            </span>
          </div>
          {patient.time_slot && (
            <div className="flex justify-between items-center">
              <span className="font-body text-sm font-semibold text-surface-500">
                Time Slot
              </span>
              <span className="font-mono-custom text-xs font-bold text-surface-900">
                {patient.time_slot}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Smart Arrival Guidance */}
      <div className="max-w-sm mx-auto mb-8">
        <SmartArrivalGuidance waitingBefore={waitingBefore} />
      </div>

      <div className="flex items-center justify-center gap-2.5 text-brand-700 text-sm font-body font-semibold bg-brand-50 border border-brand-100 rounded-xl px-5 py-3 max-w-sm mx-auto mb-8 shadow-sm">
        <Activity size={16} />
        <span>Watch the live counter for your turn</span>
      </div>

      <button
        onClick={onBack}
        className="text-surface-500 hover:text-surface-900 font-body text-sm font-semibold transition-colors bg-surface-50 hover:bg-surface-100 px-6 py-3 rounded-full"
      >
        Back to Queue View
      </button>
    </div>
  );
}

export default function PatientPortal() {
  const {
    regWindow,
    patients,
    currentToken,
    doctorName,
    addPatient,
    toast,
    initialLoading,
  } = usePatientView();
  const router = useRouter();
  const [step, setStep] = useState<Step>("home");
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(
    null,
  );

  return (
    <div className="min-h-screen relative overflow-x-hidden max-w-full bg-surface-50 flex flex-col justify-between">
      {/* Decorative background blurs */}
      <div className="blob-bg w-125 h-125 bg-brand-200 top-0 right-0 mix-blend-multiply animate-float" />
      <div
        className="blob-bg w-100 h-100 bg-accent-200 bottom-0 left-0 mix-blend-multiply animate-float"
        style={{ animationDelay: "2s" }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-surface-900">
              {doctorName}
            </p>
            <p className="text-xs text-brand-600 font-body font-medium">
              Patient Portal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 text-xs font-body font-semibold px-3 py-1.5 rounded-full border shadow-sm ${
              regWindow.isOpen
                ? "bg-brand-50 text-brand-700 border-brand-200"
                : "bg-surface-100 text-surface-500 border-surface-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${regWindow.isOpen ? "bg-brand-500 status-live" : "bg-surface-400"}`}
            />
            {regWindow.isOpen ? "Open" : "Closed"}
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-semibold text-surface-500 hover:text-surface-900 font-body transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-2xl w-full mx-auto px-4 sm:px-5 pb-20 sm:pb-28 flex-1">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="w-12 h-12 border-4 border-surface-200 border-t-brand-600 rounded-full animate-spin mb-4" />
            <p className="font-body text-surface-500 font-medium text-sm animate-pulse">
              Loading live queue data...
            </p>
          </div>
        ) : (
          step === "home" && (
            <div className="animate-slide-up">
              <div className="mb-8 mt-4">
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 leading-tight mb-2 tracking-tight">
                  Good{" "}
                  {new Date().getHours() < 12
                    ? "Morning"
                    : new Date().getHours() < 17
                      ? "Afternoon"
                      : "Evening"}{" "}
                  👋
                </h1>
                <p className="font-body text-surface-500 font-medium text-sm sm:text-base">
                  Check the live queue or register for today's OPD
                </p>
              </div>

              <QueueStatusBar patients={patients} currentToken={currentToken} />

              {/* Register CTA */}
              <button
                onClick={() => setStep("form")}
                className={`w-fit mx-auto rounded-2xl px-8 py-4 font-body font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-md ${
                  regWindow.isOpen
                    ? "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25"
                    : "bg-surface-100 text-surface-400 cursor-not-allowed shadow-none"
                }`}
                disabled={!regWindow.isOpen}
              >
                {regWindow.isOpen ? (
                  <>
                    Register & Get Token <ChevronRight size={20} />
                  </>
                ) : (
                  <>
                    <AlertCircle size={20} />
                    Registration is Currently Closed
                  </>
                )}
              </button>
            </div>
          )
        )}

        {step === "form" && (
          <div className="glass-card rounded-3xl border border-surface-200 p-6 lg:p-8 shadow-sm">
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
          <div className="glass-card rounded-3xl border border-surface-200 p-6 lg:p-8 shadow-sm">
            <SuccessScreen
              patient={registeredPatient}
              onBack={() => setStep("home")}
              patients={patients}
            />
          </div>
        )}

        {/* Logiquel Branding & Info Card */}
        <div className="mt-8 text-center bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-surface-200/80 shadow-xs">
          <div className="inline-flex items-center justify-center gap-2 bg-surface-100/80 border border-surface-200/60 rounded-full px-3.5 py-1 mb-3">
            <span className="font-body text-md text-surface-500 font-medium">
              Crafted by
            </span>
            <LogiquelLogo className="h-5.5 w-auto" />
          </div>

          <p className="font-medium text-sm text-surface-600 leading-relaxed max-w-lg mx-auto mb-3">
            Logiquel helps companies build scalable digital products—from
            websites and mobile applications to enterprise software and
            automation solutions.
          </p>

          <a
            href="tel:7048995281"
            className="inline-flex items-center gap-2 text-xs font-semibold font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 px-3.5 py-1.5 rounded-xl transition-all"
          >
            <Phone size={14} className="text-brand-600" />
            <span>
              Contact Logiquel to bring your ideas to life <br /> (+91
              7048995281)
            </span>
          </a>
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
