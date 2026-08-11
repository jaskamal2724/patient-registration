"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePatientView } from "@/lib/usePatientView";
import type { Patient, RegistrationWindow } from "@/lib/types";
import type { PatientForm } from "@/lib/api";
import Toast from "./Toast";
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
} from "lucide-react";

type Step = "home" | "form" | "success";

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

function QueueStatusBar({ patients, currentToken }: { patients: Patient[], currentToken: number }) {
  const waiting = patients.filter((p) => p.status === "waiting").length;
  const inProgress = patients.find((p) => p.status === "in-progress");
  const total = patients.length;

  return (
    <div className="glass-card rounded-3xl border border-surface-200 p-4 sm:p-6 mb-8 shadow-sm">
      <h2 className="font-display text-lg font-bold text-surface-900 mb-5">
        Live Queue Status
      </h2>

      {/* Currently Being Seen */}
      <div className="number-display rounded-2xl p-4 sm:p-6 text-white mb-6 queue-number-active shadow-lg shadow-brand-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
        <p className="font-body text-brand-100 text-xs uppercase tracking-widest font-semibold mb-2 relative z-10">
          Doctor is seeing
        </p>
        <div className="flex items-end gap-4 relative z-10">
          <span className="font-mono-custom text-5xl sm:text-6xl font-extrabold leading-none tracking-tight">
            {inProgress ? `#${inProgress.token_number}` : "—"}
          </span>
          {inProgress && (
            <div className="pb-1.5">
              <p className="font-body text-base font-bold text-white mb-0.5">
                {inProgress.name}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-300 status-live" />
                <span className="text-brand-100 text-xs font-body font-medium">
                  In consultation
                </span>
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

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          {
            label: "Waiting",
            value: waiting,
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-100",
          },
          {
            label: "Seen Today",
            value: patients.filter((p) => p.status === "done").length,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-100",
          },
          {
            label: "Registered",
            value: total,
            color: "text-brand-600",
            bg: "bg-brand-50 border-brand-100",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`rounded-xl border p-2.5 sm:p-3.5 text-center transition-all hover:scale-[1.02] ${bg}`}
          >
            <p className={`font-mono-custom text-2xl sm:text-3xl font-extrabold ${color}`}>
              {value}
            </p>
            <p className="font-body text-[10px] sm:text-xs font-semibold text-surface-500 mt-1 uppercase tracking-wide leading-tight">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegistrationForm({
  onBack,
  onSuccess,
  regWindow,
  addPatient,
}: {
  onBack: () => void;
  onSuccess: (p: Patient) => void;
  regWindow: RegistrationWindow;
  addPatient: (form: PatientForm) => Promise<Patient>;
}) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male" as "Male" | "Female" | "Other",
    phone: "",
    reason: "",
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
    if (!form.reason.trim()) e.reason = "Please describe your reason";
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
        <p className="font-body text-sm text-surface-500 max-w-xs mx-auto leading-relaxed">
          The doctor has not opened registration yet. Please check back later.
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
          {regWindow.message} · {regWindow.startTime} – {regWindow.endTime}
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

        <Field label="Reason for Visit" error={errors.reason}>
          <div className="relative">
            <FileText
              size={16}
              className="absolute left-4 top-4 text-surface-400"
            />
            <textarea
              rows={3}
              className={`input-field w-full border rounded-xl pl-11 pr-4 py-3.5 font-body text-sm transition-all resize-none shadow-sm ${errors.reason ? "border-red-300 bg-red-50 text-red-900" : "border-surface-200 bg-surface-50 text-surface-900 focus:bg-white"}`}
              placeholder="Briefly describe your symptoms or reason for visit"
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
            />
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
          {patient.token_number}
        </p>
        <p className="font-body text-white font-bold text-lg mt-6 relative z-10">
          {patient.name}
        </p>
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
          <div className="flex justify-between items-center">
            <span className="font-body text-sm font-semibold text-surface-500">
              Reason noted
            </span>
            <span className="font-body text-sm font-medium text-surface-900 max-w-35 text-right truncate">
              {patient.reason}
            </span>
          </div>
        </div>
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
  const { regWindow, patients, currentToken, doctorName, addPatient, toast, initialLoading } =
    usePatientView();
  const router = useRouter();
  const [step, setStep] = useState<Step>("home");
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(
    null,
  );

  return (
    <div className="min-h-screen relative overflow-x-hidden max-w-full bg-surface-50">
      {/* Decorative background blurs */}
      <div className="blob-bg w-125 h-125 bg-brand-200 top-0 right-0 mix-blend-multiply animate-float" />
      <div
        className="blob-bg w-100 h-100 bg-accent-200 bottom-0 left-0 mix-blend-multiply animate-float"
        style={{ animationDelay: "2s" }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-2xl mx-auto">
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
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-5 pb-12">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="w-12 h-12 border-4 border-surface-200 border-t-brand-600 rounded-full animate-spin mb-4" />
            <p className="font-body text-surface-500 font-medium text-sm animate-pulse">Loading live queue data...</p>
          </div>
        ) : step === "home" && (
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

            {/* Queue list preview */}
            {patients.filter((p) => p.status === "waiting").length > 0 && (
              <div className="bg-white rounded-3xl border border-surface-200 p-6 mb-8 shadow-sm">
                <h3 className="font-display text-lg font-bold text-surface-900 mb-5">
                  Upcoming Patients
                </h3>
                <div className="space-y-1">
                  {patients
                    .filter((p) => p.status === "waiting")
                    .slice(0, 5)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 sm:gap-3 py-3 border-b border-surface-100 last:border-0 stagger-item"
                      >
                        <span className="font-mono-custom text-sm sm:text-base font-bold text-brand-700 w-8 sm:w-10 shrink-0">
                          #{p.token_number}
                        </span>
                        <span className="font-body text-sm font-semibold text-surface-900 flex-1 min-w-0 truncate">
                          {p.name}
                        </span>
                        <span className="hidden sm:inline text-xs font-medium text-surface-500 font-body bg-surface-50 px-2 py-1 rounded-md shrink-0">
                          {p.age}y · {p.gender}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md shrink-0">
                          <Clock size={11} />
                          <span>Waiting</span>
                        </div>
                      </div>
                    ))}
                  {patients.filter((p) => p.status === "waiting").length >
                    5 && (
                    <p className="text-xs font-semibold text-surface-500 font-body text-center pt-4 mt-2 border-t border-surface-100">
                      +
                      {patients.filter((p) => p.status === "waiting").length -
                        5}{" "}
                      more in queue
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Register CTA */}
            <button
              onClick={() => setStep("form")}
              className={`w-full rounded-2xl py-5 font-body font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
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

            {!regWindow.isOpen && (
              <p className="text-center font-body text-sm font-medium text-surface-500 mt-4">
                The doctor will open registration when the session begins.
              </p>
            )}
          </div>
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
      </main>

      <Toast toast={toast} />
    </div>
  );
}
