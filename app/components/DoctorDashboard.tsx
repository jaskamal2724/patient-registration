"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDoctor } from "@/lib/useDoctor";
import type { Doctor, Patient } from "@/lib/types";
import Toast from "./Toast";
import {
  Stethoscope,
  LogOut,
  Users,
  Clock,
  CheckCircle2,
  SkipForward,
  Play,
  Square,
  ChevronRight,
  Settings,
  Calendar,
  TrendingUp,
  X,
  Edit3,
  Filter,
  Footprints,
  Save,
  Check,
} from "lucide-react";
import InstallPWA from "./InstallPWA";
import LogiquelAdCard from "./LogiquelAdCard";
import { formatDelayText, getTimeSlots } from "../util/timeSlot";

type Tab = "queue" | "walkin" | "settings";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgLight,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  bgLight: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-3 sm:p-4 card-lift shadow-sm border border-surface-200 stagger-item min-w-0 ${onClick ? "cursor-pointer hover:border-brand-200 hover:shadow-md transition-all ring-2 ring-transparent hover:ring-brand-100" : ""}`}
      onClick={onClick}
    >
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${bgLight} shrink-0`}
      >
        <Icon size={16} className={color} />
      </div>
      <p className="font-mono-custom text-xl sm:text-3xl font-bold text-surface-900 mb-0.5 truncate">
        {value}
      </p>
      <p className="font-body text-[10px] sm:text-xs text-surface-500 uppercase tracking-wider font-medium leading-tight truncate">
        {label}
      </p>
    </div>
  );
}

export default function DoctorDashboard({ doctor }: { doctor: Doctor }) {
  const {
    doctorName,
    setDoctorName,
    logout,
    regWindow,
    setRegWindow,
    toggleRegistration,
    patients,
    walkinPatients,
    callNext,
    skipPatient,
    updatePatientTimeSlot,
    markWalkinDone,
    skipWalkinPatient,
    callNextWalkin,
    currentToken,
    loading,
    toast,
  } = useDoctor(doctor);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("queue");
  const [editName, setEditName] = useState(false);
  const [tempName, setTempName] = useState(doctorName);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showWalkinCompletedModal, setShowWalkinCompletedModal] = useState(false);
  const [walkinFilter, setWalkinFilter] = useState<"all" | "pwd" | "senior" | "children">("all");

  // State for updating / rescheduling patient time slot
  const [reschedulePatient, setReschedulePatient] = useState<Patient | null>(null);
  const [selectedNewSlot, setSelectedNewSlot] = useState<string>("");
  const [resetStatusToWaiting, setResetStatusToWaiting] = useState<boolean>(true);
  const [isUpdatingSlot, setIsUpdatingSlot] = useState<boolean>(false);
  const [slotFilter, setSlotFilter] = useState<string>("all");

  // Local form state for Settings tab to ensure smooth editing and 100% DB synchronization
  const [formDate, setFormDate] = useState(regWindow.date || "");
  const [formStartTime, setFormStartTime] = useState(
    regWindow.startTime || "10:00",
  );
  const [formEndTime, setFormEndTime] = useState(
    regWindow.endTime || "19:00",
  );
  const [formMessage, setFormMessage] = useState(regWindow.message || "");
  const [formPatientsPerHour, setFormPatientsPerHour] = useState(
    regWindow.patientsPerHour ?? 10,
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Keep form state in sync whenever regWindow changes from database/realtime
  useEffect(() => {
    setFormDate(regWindow.date || "");
    setFormStartTime(regWindow.startTime || "10:00");
    setFormEndTime(regWindow.endTime || "19:00");
    setFormMessage(regWindow.message || "");
    setFormPatientsPerHour(regWindow.patientsPerHour ?? 10);
  }, [
    regWindow.date,
    regWindow.startTime,
    regWindow.endTime,
    regWindow.message,
    regWindow.patientsPerHour,
  ]);

  const isSettingsDirty =
    formDate !== (regWindow.date || "") ||
    formStartTime !== (regWindow.startTime || "10:00") ||
    formEndTime !== (regWindow.endTime || "19:00") ||
    formMessage !== (regWindow.message || "") ||
    formPatientsPerHour !== (regWindow.patientsPerHour ?? 10);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setRegWindow({
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        message: formMessage,
        patientsPerHour: formPatientsPerHour,
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const waiting = patients.filter((p) => p.status === "waiting");
  const inProgress = patients.find((p) => p.status === "in-progress");
  const done = patients.filter((p) => p.status === "done");

  const walkinWaiting = walkinPatients.filter((p) => p.status === "waiting");
  const walkinInProgress = walkinPatients.find((p) => p.status === "in-progress");
  const walkinDone = walkinPatients.filter((p) => p.status === "done");

  const pwdWalkinsCount = walkinPatients.filter((p) => Boolean(p.pwd)).length;
  const seniorWalkinsCount = walkinPatients.filter((p) => {
    const age = parseInt(p.age, 10);
    return !isNaN(age) && age >= 80;
  }).length;
  const childrenWalkinsCount = walkinPatients.filter((p) => {
    const age = parseInt(p.age, 10);
    return !isNaN(age) && age > 0 && age <= 10;
  }).length;

  const filteredWalkinPatients = walkinPatients.filter((p) => {
    if (walkinFilter === "pwd") return Boolean(p.pwd);
    if (walkinFilter === "senior") {
      const age = parseInt(p.age, 10);
      return !isNaN(age) && age >= 80;
    }
    if (walkinFilter === "children") {
      const age = parseInt(p.age, 10);
      return !isNaN(age) && age > 0 && age <= 10;
    }
    return true;
  });

  const availableSlots = useMemo(() => {
    const generated = getTimeSlots(
      regWindow.startTime || "10:00",
      regWindow.endTime || "19:00",
      "14:00",
      "15:00",
      60,
      regWindow.delayMinutes || 0
    ).map((s: { label: string }) => s.label);

    const existingSlots = Array.from(
      new Set(patients.map((p) => p.time_slot).filter(Boolean) as string[])
    );

    return Array.from(new Set([...generated, ...existingSlots]));
  }, [regWindow.startTime, regWindow.endTime, regWindow.delayMinutes, patients]);

  const filteredOnlinePatients = useMemo(() => {
    if (slotFilter === "all") return patients;
    return patients.filter((p) => p.time_slot === slotFilter);
  }, [patients, slotFilter]);

  const handleOpenReschedule = (p: Patient) => {
    setReschedulePatient(p);
    setSelectedNewSlot(p.time_slot || availableSlots[0] || "");
    setResetStatusToWaiting(p.status === "skipped");
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulePatient || !selectedNewSlot) return;
    setIsUpdatingSlot(true);
    try {
      await updatePatientTimeSlot(
        reschedulePatient.id,
        selectedNewSlot,
        resetStatusToWaiting
      );
      setReschedulePatient(null);
    } catch {
      // Error toast triggered in useDoctor hook
    } finally {
      setIsUpdatingSlot(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      waiting: "bg-amber-50 text-amber-700 border-amber-200",
      "in-progress": "bg-brand-50 text-brand-700 border-brand-200",
      done: "bg-surface-100 text-surface-500 border-surface-200",
      skipped: "bg-red-50 text-red-600 border-red-200",
    };
    return map[status] || map.waiting;
  };

  return (
    <div className="min-h-screen bg-surface-50 w-full overflow-x-hidden">
      <div className="min-h-screen w-full lg:flex">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-surface-200 p-6 fixed h-full z-10 shadow-sm">
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <Stethoscope size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-surface-900 leading-tight">
                Doc Care
              </p>
              <p className="text-brand-600 text-xs font-body font-medium mb-1.5">
                Doctor Panel
              </p>
              <InstallPWA />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 mb-8 border transition-colors ${regWindow.isOpen ? "bg-brand-50 border-brand-200" : "bg-surface-50 border-surface-200"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${regWindow.isOpen ? "bg-brand-500 status-live" : "bg-surface-400"}`}
              />
              <span
                className={`font-body text-xs font-semibold ${regWindow.isOpen ? "text-brand-700" : "text-surface-500"}`}
              >
                {regWindow.isOpen ? "Registration Open" : "Registration Closed"}
              </span>
            </div>
            {inProgress && (
              <p className="text-brand-600 text-xs font-body font-medium">
                Seeing: Token {inProgress.token_number}
              </p>
            )}
          </div>

          <nav className="space-y-1.5 flex-1">
            {(
              [
                ["queue", "Online Queue", Users, waiting.length],
                ["walkin", "Walk-in Queue", Footprints, walkinWaiting.length],
                ["settings", "Settings", Settings, null],
              ] as [Tab, string, any, number | null][]
            ).map(([id, label, Icon, count]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-body text-sm font-medium transition-all ${
                  tab === id
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  {label}
                </div>
                {count !== null && count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      tab === id
                        ? "bg-white/20 text-white"
                        : "bg-surface-100 text-surface-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="border-t border-surface-200 pt-4 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-display text-sm font-bold text-brand-700">
                {doctorName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-body text-sm font-bold text-surface-900 truncate">
                  {doctorName}
                </p>
                <p className="text-surface-500 text-xs font-medium">
                  General Physician
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-surface-500 hover:text-red-600 hover:bg-red-50 rounded-xl py-2.5 text-xs font-body font-medium transition-all"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-surface-200 px-3.5 sm:px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/20">
              <Stethoscope size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-bold text-surface-900 leading-tight text-sm block truncate">
                Doc Care
              </span>
              <span className="text-[10px] text-brand-600 font-body font-semibold block leading-none">
                Doctor Panel
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <InstallPWA />
            <div
              className={`flex items-center gap-1.5 text-[10px] font-body font-semibold px-2 sm:px-2.5 py-1 rounded-full border ${regWindow.isOpen ? "bg-brand-50 text-brand-700 border-brand-200" : "bg-surface-100 text-surface-500 border-surface-200"}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${regWindow.isOpen ? "bg-brand-500 status-live" : "bg-surface-400"}`}
              />
              <span>{regWindow.isOpen ? "Open" : "Closed"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-surface-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full lg:flex-1 min-w-0 lg:ml-64 pt-16 lg:pt-0">
          <div className="p-3 sm:p-5 lg:p-8 max-w-5xl mx-auto w-full min-w-0">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-6 mt-1 lg:mt-8 gap-3 sm:gap-4">
              <div className="min-w-0">
                {editName ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="input-field border border-brand-300 rounded-xl px-3 py-1.5 font-display text-xl sm:text-2xl font-bold text-surface-900 bg-white shadow-sm w-full max-w-xs"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={() => {
                        setDoctorName(tempName);
                        setEditName(false);
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (setDoctorName(tempName), setEditName(false))
                      }
                      autoFocus
                    />
                    <button
                      onClick={() => setEditName(false)}
                      className="p-1.5 hover:bg-surface-200 rounded-lg shrink-0"
                    >
                      <X size={18} className="text-surface-500" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => setEditName(true)}
                  >
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight truncate">
                      {doctorName}
                    </h1>
                    <div className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-surface-200 transition-all shrink-0">
                      <Edit3 size={16} className="text-surface-400" />
                    </div>
                  </div>
                )}
                <p className="font-body text-xs sm:text-sm text-surface-500 mt-0.5 font-medium">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Action Buttons & Quick Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Doctor Delay Quick Selector */}
                <div className={`relative flex items-center gap-1.5 border rounded-xl px-3 py-2 transition-all shadow-xs w-fit ${
                  regWindow.delayMinutes > 0
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : "bg-surface-50 border-surface-200 text-surface-700"
                }`}>
                  <Clock size={16} className={regWindow.delayMinutes > 0 ? "text-amber-600 animate-pulse shrink-0" : "text-surface-400 shrink-0"} />
                  <span className="font-body text-xs font-semibold whitespace-nowrap">Late Status:</span>
                  <select
                    value={regWindow.delayMinutes}
                    onChange={(e) => setRegWindow({ delayMinutes: parseInt(e.target.value, 10) || 0 })}
                    className="bg-transparent font-body text-xs font-extrabold text-surface-900 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value={0}>🟢 On Time (0m)</option>
                    <option value={15}>⏱️ +15m Late</option>
                    <option value={30}>⏱️ +30m Late</option>
                    <option value={45}>⏱️ +45m Late</option>
                    <option value={60}>⏱️ +1h Late</option>
                    <option value={90}>⏱️ +1.5h Late</option>
                    <option value={120}>⏱️ +2h Late</option>
                  </select>
                </div>

                {/* Registration Toggle Button */}
                <button
                  onClick={() => toggleRegistration(!regWindow.isOpen)}
                  disabled={loading}
                  className={`w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-body text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shrink-0 ${
                    regWindow.isOpen
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                      : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <>
                      {regWindow.isOpen ? (
                        <Square size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      <span>
                        {regWindow.isOpen
                          ? "Close Registration"
                          : "Open Registration"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Segmented Mobile Tabs */}
            <div className="flex lg:hidden gap-1 bg-surface-200/60 backdrop-blur-xs rounded-2xl p-1 mb-5 sm:mb-6 border border-surface-200/80 w-full">
              {(
                [
                  ["queue", "Online", Users, waiting.length],
                  ["walkin", "Walk-in", Footprints, walkinWaiting.length],
                  ["settings", "Settings", Settings, null],
                ] as [Tab, string, any, number | null][]
              ).map(([t, label, Icon, count]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 min-w-0 py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-xl font-body text-xs font-bold capitalize transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                    tab === t
                      ? "bg-white text-surface-900 shadow-md shadow-surface-900/5 border border-surface-200/50"
                      : "text-surface-600 hover:text-surface-900"
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  <span className="truncate">{label}</span>
                  {count !== null && count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold shrink-0 ${
                        tab === t
                          ? "bg-brand-100 text-brand-700"
                          : "bg-surface-200 text-surface-700"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Queue Tab */}
            {tab === "queue" && (
              <div className="space-y-4 sm:space-y-6 w-full min-w-0">
                {/* Stats Grid - Online Patients */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 w-full">
                  <StatCard
                    label="Total Patients"
                    value={patients.length}
                    icon={Users}
                    color="text-brand-600"
                    bgLight="bg-brand-50"
                  />
                  <StatCard
                    label="Waiting"
                    value={waiting.length}
                    icon={Clock}
                    color="text-amber-600"
                    bgLight="bg-amber-50"
                  />
                  <StatCard
                    label="Completed"
                    value={done.length}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    bgLight="bg-emerald-50"
                    onClick={() => setShowCompletedModal(true)}
                  />
                  <StatCard
                    label="Current Token"
                    value={currentToken ? `#${currentToken}` : "—"}
                    icon={TrendingUp}
                    color="text-accent-600"
                    bgLight="bg-accent-50"
                  />
                </div>
                {/* Currently Seeing Banner */}
                {inProgress && (
                  <div className="bg-linear-to-br from-brand-600 to-accent-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden w-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-3.5 sm:gap-6">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-xs mb-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <p className="font-body text-white text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold">
                            Currently Seeing
                          </p>
                        </div>
                        <p className="font-display text-3xl sm:text-5xl font-extrabold mb-1 tracking-tight">
                          Token{" "}
                          {inProgress.slot_token_number ||
                            inProgress.token_number}
                        </p>
                        <p className="font-body text-white font-bold text-sm sm:text-lg truncate">
                          {inProgress.name} · {inProgress.age}y ·{" "}
                          {inProgress.gender}
                        </p>
                        {inProgress.time_slot && (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-body text-brand-100 text-xs sm:text-sm truncate font-medium">
                              Slot: {inProgress.time_slot}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleOpenReschedule(inProgress)}
                              className="text-[11px] font-bold text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer"
                              title="Reschedule current patient slot"
                            >
                              <Edit3 size={10} />
                              <span>Change</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-md border border-white/20 shrink-0 w-fit">
                        <button
                          onClick={callNext}
                          disabled={loading}
                          className="w-fit bg-white hover:bg-brand-50 active:scale-98 text-brand-700 border border-transparent rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 font-body font-bold text-xs sm:text-sm transition-all shadow-md text-center cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
                        >
                          <span>Call Next Patient</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Call Next Button Bar */}
                <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3 sm:p-4 rounded-2xl border border-surface-200 shadow-xs w-full">
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-surface-900 flex items-center gap-2">
                      <span>Online Queue</span>
                      <span className="font-body text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 sm:py-1 rounded-full border border-brand-100">
                        {waiting.length} waiting
                      </span>
                    </h2>
                  </div>
                  <button
                    onClick={callNext}
                    disabled={(!inProgress && waiting.length === 0) || loading}
                    className="w-fit inline-flex items-center justify-center gap-2 bg-surface-900 hover:bg-surface-800 disabled:bg-surface-100 disabled:text-surface-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-body font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-md active:scale-98 whitespace-nowrap cursor-pointer shrink-0"
                  >
                    <span>Call Next Patient</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Slot Filter Bar */}
                {availableSlots.length > 0 && patients.length > 0 && (
                  <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-surface-200/80 shadow-2xs w-full overflow-hidden">
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 no-scrollbar text-xs w-full">
                      <span className="font-body font-bold text-surface-500 whitespace-nowrap flex items-center gap-1 shrink-0 pl-1 text-[11px] sm:text-xs">
                        <Filter size={13} className="text-brand-600" />
                        <span>Filter:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSlotFilter("all")}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs shrink-0 ${
                          slotFilter === "all"
                            ? "bg-surface-900 text-white shadow-xs"
                            : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                        }`}
                      >
                        All Slots ({patients.length})
                      </button>
                      {availableSlots.map((slot) => {
                        const countInSlot = patients.filter((p) => p.time_slot === slot).length;
                        if (countInSlot === 0 && slotFilter !== slot) return null;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSlotFilter(slot)}
                            className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-xs shrink-0 ${
                              slotFilter === slot
                                ? "bg-brand-600 text-white shadow-xs"
                                : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                            }`}
                          >
                            <span>{slot}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-custom ${
                                slotFilter === slot
                                  ? "bg-white/20 text-white"
                                  : "bg-surface-200 text-surface-700"
                              }`}
                            >
                              {countInSlot}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Patient List */}
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden w-full">
                  {patients.length === 0 ? (
                    <div className="text-center py-14 sm:py-20 px-4">
                      <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Users size={24} className="text-surface-400" />
                      </div>
                      <p className="font-display text-base font-bold text-surface-900 mb-1">
                        Queue is empty
                      </p>
                      <p className="font-body text-xs text-surface-500 max-w-xs mx-auto">
                        No online patients registered for today yet.
                      </p>
                    </div>
                  ) : filteredOnlinePatients.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Clock size={22} className="text-surface-400" />
                      </div>
                      <p className="font-display text-sm font-bold text-surface-900 mb-1">
                        No patients in this slot
                      </p>
                      <p className="font-body text-xs text-surface-500 mb-3">
                        No patients found for slot &ldquo;{slotFilter}&rdquo;.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSlotFilter("all")}
                        className="text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200 transition-colors cursor-pointer"
                      >
                        Show All Slots
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-100">
                      {filteredOnlinePatients.map((p) => (
                        <div
                          key={p.id}
                          className={`p-3.5 sm:p-4 transition-all hover:bg-surface-50 w-full ${
                            p.status === "done" || p.status === "skipped"
                              ? "bg-surface-50/50 opacity-60"
                              : ""
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 w-full">
                            {/* Patient Info */}
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-mono-custom font-extrabold text-sm sm:text-base shrink-0 shadow-xs ${
                                  p.status === "in-progress"
                                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                                    : p.status === "done"
                                      ? "bg-surface-200 text-surface-500"
                                      : p.status === "skipped"
                                        ? "bg-red-100 text-red-500"
                                        : "bg-brand-50 text-brand-700 border border-brand-200/80"
                                }`}
                              >
                                {p.slot_token_number || p.token_number}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap mb-0.5">
                                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <p className="font-body font-bold text-surface-900 text-sm sm:text-base truncate">
                                      {p.name}
                                    </p>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full border font-body font-bold uppercase tracking-wider shrink-0 ${statusBadge(p.status)}`}
                                    >
                                      {p.status === "in-progress"
                                        ? "In Progress"
                                        : p.status}
                                    </span>
                                  </div>

                                  {/* Mobile-only timestamp positioned in the header row */}
                                  <span className="sm:hidden font-mono-custom text-[10px] font-medium text-surface-400 bg-surface-100/70 px-2 py-0.5 rounded-md shrink-0">
                                    {new Date(p.registered_at).toLocaleTimeString(
                                      "en-IN",
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </span>
                                </div>

                                <p className="font-body text-xs text-surface-600 font-semibold mb-1.5 flex items-center gap-1.5 flex-wrap">
                                  <span>{p.age}y · {p.gender}</span>
                                  <span className="text-surface-300">·</span>
                                  <a
                                    href={`tel:${p.phone}`}
                                    className="text-brand-600 underline underline-offset-2 hover:text-brand-800"
                                  >
                                    {p.phone}
                                  </a>
                                </p>

                                {p.time_slot && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReschedule(p)}
                                    className="inline-flex items-center gap-1 text-[11px] font-mono-custom font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 hover:border-brand-300 px-2.5 py-0.5 rounded-md border border-brand-100 transition-all cursor-pointer group shadow-2xs max-w-full"
                                    title="Click to update patient time slot"
                                  >
                                    <Clock size={11} className="text-brand-600 group-hover:scale-110 transition-transform shrink-0" />
                                    <span className="truncate">{p.time_slot}</span>
                                    <Edit3 size={10} className="text-brand-400 group-hover:text-brand-700 ml-0.5 transition-colors shrink-0" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Actions & Timestamp (Desktop & Mobile) */}
                            <div className="flex items-center sm:flex-col sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-surface-100 sm:border-0 w-full sm:w-auto">
                              <span className="hidden sm:inline-block font-mono-custom text-[11px] font-medium text-surface-400 bg-surface-100/70 px-2 py-0.5 rounded-md">
                                {new Date(p.registered_at).toLocaleTimeString(
                                  "en-IN",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>

                              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end">
                                {p.status === "waiting" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReschedule(p)}
                                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 hover:text-brand-800 active:scale-95 px-3 py-1.5 rounded-lg transition-all border border-brand-200 cursor-pointer shadow-2xs whitespace-nowrap"
                                      title="Update patient's time slot"
                                    >
                                      <Clock size={12} className="shrink-0 text-brand-600" />
                                      <span>Change Slot</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => skipPatient(p.id)}
                                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-xs font-bold text-surface-600 hover:text-red-600 hover:bg-red-50 active:scale-95 px-3 py-1.5 rounded-lg transition-all border border-surface-200 cursor-pointer shadow-2xs whitespace-nowrap"
                                      title="Skip patient"
                                    >
                                      <SkipForward size={12} className="shrink-0" />
                                      <span>Skip</span>
                                    </button>
                                  </>
                                )}
                                {p.status === "skipped" && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReschedule(p)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 active:scale-95 px-3 py-1.5 rounded-lg transition-all border border-amber-300 cursor-pointer shadow-2xs whitespace-nowrap"
                                    title="Reschedule skipped patient to a new time slot"
                                  >
                                    <Clock size={12} className="shrink-0 text-amber-600" />
                                    <span>Reschedule Slot</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Walk-in Queue Tab */}
            {tab === "walkin" && (
              <div className="space-y-4 sm:space-y-6 animate-slide-up w-full min-w-0">
                {/* Walk-in Priority Filters */}
                <div className="bg-white border border-surface-200/80 rounded-2xl p-3.5 sm:p-5 shadow-xs w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Filter size={15} />
                      </div>
                      <div>
                        <h3 className="font-display text-sm sm:text-base font-bold text-surface-900 leading-tight">
                          Priority Filters
                        </h3>
                        <p className="font-body text-[11px] sm:text-xs text-surface-500">
                          Click any filter to view priority walk-in patients
                        </p>
                      </div>
                    </div>
                    {walkinFilter !== "all" && (
                      <button
                        onClick={() => setWalkinFilter("all")}
                        className="inline-flex items-center gap-1.5 text-xs font-body font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer self-start sm:self-auto border border-amber-200"
                      >
                        <X size={13} />
                        <span>Show All ({walkinPatients.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                    {/* PWD Filter Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setWalkinFilter((prev) => (prev === "pwd" ? "all" : "pwd"))
                      }
                      className={`flex flex-col sm:flex-row items-center sm:justify-between p-2.5 sm:p-3.5 rounded-xl border text-center sm:text-left transition-all cursor-pointer active:scale-98 ${
                        walkinFilter === "pwd"
                          ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/50"
                          : "bg-surface-50 hover:bg-amber-50/70 text-surface-800 border-surface-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 min-w-0">
                        <span className="text-xl sm:text-2xl shrink-0" role="img" aria-label="PWD">
                          ♿
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`font-display text-xs sm:text-sm font-bold truncate ${
                              walkinFilter === "pwd" ? "text-white" : "text-surface-900"
                            }`}
                          >
                            PWD
                          </p>
                          <p
                            className={`hidden sm:block font-body text-[11px] truncate ${
                              walkinFilter === "pwd" ? "text-amber-100" : "text-surface-500"
                            }`}
                          >
                            Person with disability
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0 mt-1 sm:mt-0 ${
                          walkinFilter === "pwd"
                            ? "bg-white text-amber-700 font-extrabold"
                            : "bg-amber-100/80 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {pwdWalkinsCount}
                      </span>
                    </button>

                    {/* Senior Citizen Filter Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setWalkinFilter((prev) => (prev === "senior" ? "all" : "senior"))
                      }
                      className={`flex flex-col sm:flex-row items-center sm:justify-between p-2.5 sm:p-3.5 rounded-xl border text-center sm:text-left transition-all cursor-pointer active:scale-98 ${
                        walkinFilter === "senior"
                          ? "bg-purple-600 text-white border-purple-700 shadow-md shadow-purple-600/25 ring-2 ring-purple-400/50"
                          : "bg-surface-50 hover:bg-purple-50/70 text-surface-800 border-surface-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 min-w-0">
                        <span
                          className="text-xl sm:text-2xl shrink-0"
                          role="img"
                          aria-label="Senior Citizen"
                        >
                          👴
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`font-display text-xs sm:text-sm font-bold truncate ${
                              walkinFilter === "senior" ? "text-white" : "text-surface-900"
                            }`}
                          >
                            Senior (80+)
                          </p>
                          <p
                            className={`hidden sm:block font-body text-[11px] truncate ${
                              walkinFilter === "senior" ? "text-purple-100" : "text-surface-500"
                            }`}
                          >
                            Age 80 and above
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0 mt-1 sm:mt-0 ${
                          walkinFilter === "senior"
                            ? "bg-white text-purple-700 font-extrabold"
                            : "bg-purple-100/80 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {seniorWalkinsCount}
                      </span>
                    </button>

                    {/* Small Children Filter Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setWalkinFilter((prev) => (prev === "children" ? "all" : "children"))
                      }
                      className={`flex flex-col sm:flex-row items-center sm:justify-between p-2.5 sm:p-3.5 rounded-xl border text-center sm:text-left transition-all cursor-pointer active:scale-98 ${
                        walkinFilter === "children"
                          ? "bg-sky-600 text-white border-sky-700 shadow-md shadow-sky-600/25 ring-2 ring-sky-400/50"
                          : "bg-surface-50 hover:bg-sky-50/70 text-surface-800 border-surface-200 hover:border-sky-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 min-w-0">
                        <span
                          className="text-xl sm:text-2xl shrink-0"
                          role="img"
                          aria-label="Small Children"
                        >
                          👶
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`font-display text-xs sm:text-sm font-bold truncate ${
                              walkinFilter === "children" ? "text-white" : "text-surface-900"
                            }`}
                          >
                            Child (≤10)
                          </p>
                          <p
                            className={`hidden sm:block font-body text-[11px] truncate ${
                              walkinFilter === "children" ? "text-sky-100" : "text-surface-500"
                            }`}
                          >
                            Age 10 or younger
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0 mt-1 sm:mt-0 ${
                          walkinFilter === "children"
                            ? "bg-white text-sky-700 font-extrabold"
                            : "bg-sky-100/80 text-sky-800 border border-sky-200"
                        }`}
                      >
                        {childrenWalkinsCount}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Walkin Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 w-full">
                  <StatCard
                    label="Total Walk-ins"
                    value={walkinPatients.length}
                    icon={Footprints}
                    color="text-amber-600"
                    bgLight="bg-amber-50"
                  />
                  <StatCard
                    label="Waiting"
                    value={walkinWaiting.length}
                    icon={Clock}
                    color="text-amber-600"
                    bgLight="bg-amber-50"
                  />
                  <StatCard
                    label="Completed"
                    value={walkinDone.length}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    bgLight="bg-emerald-50"
                    onClick={() => setShowWalkinCompletedModal(true)}
                  />
                  <StatCard
                    label="Active Walk-in"
                    value={walkinInProgress ? (walkinInProgress.walkin_token_display || `W-${walkinInProgress.token_number}`) : "—"}
                    icon={TrendingUp}
                    color="text-brand-600"
                    bgLight="bg-brand-50"
                  />
                </div>

                {/* Currently Seeing Walkin Banner */}
                {walkinInProgress && (
                  <div className="bg-linear-to-br from-amber-600 to-amber-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden w-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-3.5 sm:gap-6">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-xs mb-2">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <p className="font-body text-white text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold">
                            Currently Seeing Walk-in
                          </p>
                        </div>
                        <p className="font-display text-3xl sm:text-5xl font-extrabold mb-1 tracking-tight">
                          Token {walkinInProgress.walkin_token_display || `W-${walkinInProgress.token_number}`}
                        </p>
                        <p className="font-body text-white font-bold text-sm sm:text-lg truncate">
                          {walkinInProgress.name} · {walkinInProgress.age}y · {walkinInProgress.gender}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          {walkinInProgress.pwd && (
                            <span className="inline-flex items-center gap-1 bg-white/20 text-white border border-white/30 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                              ♿ PwD
                            </span>
                          )}
                          {!isNaN(parseInt(walkinInProgress.age, 10)) && parseInt(walkinInProgress.age, 10) >= 80 && (
                            <span className="inline-flex items-center gap-1 bg-white/20 text-white border border-white/30 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                              👴 Senior (80+)
                            </span>
                          )}
                          {!isNaN(parseInt(walkinInProgress.age, 10)) && parseInt(walkinInProgress.age, 10) > 0 && parseInt(walkinInProgress.age, 10) <= 10 && (
                            <span className="inline-flex items-center gap-1 bg-white/20 text-white border border-white/30 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                              👶 Child (≤10)
                            </span>
                          )}
                          {walkinInProgress.city_village && (
                            <p className="font-body text-amber-100 text-xs sm:text-sm truncate font-medium">
                              From: {walkinInProgress.city_village}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-md border border-white/20 shrink-0 w-fit">
                        <button
                          onClick={callNextWalkin}
                          disabled={loading}
                          className="w-fit bg-white hover:bg-amber-50 active:scale-98 text-amber-800 border border-transparent rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 font-body font-bold text-xs sm:text-sm transition-all shadow-md text-center cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
                        >
                          <span>Call Next Patient</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Call Next Walk-in Bar */}
                <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3 sm:p-4 rounded-2xl border border-surface-200 shadow-xs w-full">
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-surface-900 flex items-center gap-2 flex-wrap">
                      <span>Walk-in Patients</span>
                      <span className="font-body text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-200">
                        {walkinWaiting.length} waiting
                      </span>
                      {walkinFilter !== "all" && (
                        <span className="font-body text-xs font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full">
                          Filtered: {filteredWalkinPatients.length}
                        </span>
                      )}
                    </h2>
                  </div>
                  <button
                    onClick={callNextWalkin}
                    disabled={(!walkinInProgress && walkinWaiting.length === 0) || loading}
                    className="w-fit inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-surface-100 disabled:text-surface-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-body font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-md active:scale-98 whitespace-nowrap cursor-pointer shrink-0"
                  >
                    <span>Call Next Patient</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Walk-in Patient List */}
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden w-full">
                  {walkinPatients.length === 0 ? (
                    <div className="text-center py-14 sm:py-20 px-4">
                      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Footprints size={24} className="text-amber-500" />
                      </div>
                      <p className="font-display text-base font-bold text-surface-900 mb-1">
                        No walk-in patients
                      </p>
                      <p className="font-body text-xs text-surface-500 max-w-xs mx-auto">
                        Patients registering through the clinic QR code will appear here instantly.
                      </p>
                    </div>
                  ) : filteredWalkinPatients.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 px-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
                        <Filter size={20} />
                      </div>
                      <p className="font-display text-base font-bold text-surface-900 mb-1">
                        No walk-in patients match this filter
                      </p>
                      <p className="font-body text-xs text-surface-500 max-w-xs mx-auto mb-4">
                        {walkinFilter === "pwd" && "No walk-in patients marked as PWD (Person with Disability)."}
                        {walkinFilter === "senior" && "No walk-in patients aged 80 or above."}
                        {walkinFilter === "children" && "No walk-in patients aged 10 or younger."}
                      </p>
                      <button
                        onClick={() => setWalkinFilter("all")}
                        className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Show All ({walkinPatients.length})
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-100">
                      {filteredWalkinPatients.map((p) => {
                        const ageNum = parseInt(p.age, 10);
                        const isSenior = !isNaN(ageNum) && ageNum >= 80;
                        const isChild = !isNaN(ageNum) && ageNum > 0 && ageNum <= 10;
                        return (
                          <div
                            key={p.id}
                            className={`p-3.5 sm:p-4 transition-all hover:bg-surface-50 w-full ${
                              p.status === "done" || p.status === "skipped"
                                ? "bg-surface-50/50 opacity-60"
                                : ""
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 w-full">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div
                                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-mono-custom font-extrabold text-sm sm:text-base shrink-0 shadow-xs ${
                                    p.status === "in-progress"
                                      ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                                      : p.status === "done"
                                        ? "bg-surface-200 text-surface-500"
                                        : p.status === "skipped"
                                          ? "bg-red-100 text-red-500"
                                          : "bg-amber-50 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {p.walkin_token_display || `W-${p.token_number}`}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap mb-0.5">
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                      <p className="font-body font-bold text-surface-900 text-sm sm:text-base truncate">
                                        {p.name}
                                      </p>
                                      {p.pwd && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-300 bg-amber-100 text-amber-800 font-body font-bold shrink-0">
                                          ♿ PwD
                                        </span>
                                      )}
                                      {isSenior && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-300 bg-purple-100 text-purple-800 font-body font-bold shrink-0">
                                          👴 Senior (80+)
                                        </span>
                                      )}
                                      {isChild && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-sky-300 bg-sky-100 text-sky-800 font-body font-bold shrink-0">
                                          👶 Child (≤10)
                                        </span>
                                      )}
                                      <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full border font-body font-bold uppercase tracking-wider shrink-0 ${statusBadge(p.status)}`}
                                      >
                                        {p.status === "in-progress" ? "In Progress" : p.status}
                                      </span>
                                    </div>

                                    {/* Mobile-only timestamp positioned in the header row */}
                                    <span className="sm:hidden font-mono-custom text-[10px] font-medium text-surface-400 bg-surface-100/70 px-2 py-0.5 rounded-md shrink-0">
                                      {new Date(p.registered_at).toLocaleTimeString(
                                        "en-IN",
                                        { hour: "2-digit", minute: "2-digit" },
                                      )}
                                    </span>
                                  </div>

                                  <p className="font-body text-xs text-surface-600 font-semibold mb-1">
                                    {p.age}y · {p.gender} ·{" "}
                                    <a
                                      href={`tel:${p.phone}`}
                                      className="text-amber-700 underline underline-offset-2 hover:text-amber-900"
                                    >
                                      {p.phone}
                                    </a>
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap mt-1">
                                    {p.city_village && (
                                      <span className="inline-block text-[11px] font-body font-medium text-surface-600 bg-surface-100 px-2 py-0.5 rounded-md">
                                        📍 {p.city_village}
                                      </span>
                                    )}
                                    {p.reason && (
                                      <span className="inline-block text-[11px] font-body font-medium text-surface-500 bg-surface-50 px-2 py-0.5 rounded-md border border-surface-200/60 truncate max-w-xs">
                                        {p.reason}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center sm:flex-col sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-surface-100 sm:border-0 w-full sm:w-auto">
                                <span className="hidden sm:inline-block font-mono-custom text-[11px] font-medium text-surface-400 bg-surface-100/70 px-2 py-0.5 rounded-md">
                                  {new Date(p.registered_at).toLocaleTimeString(
                                    "en-IN",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                                {p.status !== "done" && p.status !== "skipped" && (
                                  <div className="flex items-center gap-1.5 flex-wrap justify-end w-full sm:w-auto">
                                    <button
                                      type="button"
                                      onClick={() => markWalkinDone(p.id)}
                                      disabled={loading}
                                      className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-all border border-emerald-200 cursor-pointer shadow-2xs whitespace-nowrap"
                                      title="Mark walk-in patient as done"
                                    >
                                      <CheckCircle2 size={12} className="shrink-0" />
                                      <span>Mark Done</span>
                                    </button>
                                    {p.status === "waiting" && (
                                      <button
                                        onClick={() => skipWalkinPatient(p.id)}
                                        disabled={loading}
                                        className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs font-bold text-surface-600 hover:text-red-600 hover:bg-red-50 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-all border border-surface-200 cursor-pointer shadow-2xs whitespace-nowrap"
                                        title="Skip walk-in patient"
                                      >
                                        <SkipForward size={12} className="shrink-0" />
                                        <span>Skip</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {tab === "settings" && (
              <div className="animate-slide-up">
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5 sm:p-6 lg:p-8 mb-6">
                  <div className="flex items-center gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-surface-100">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <Calendar size={20} className="text-brand-600" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-surface-900">
                        Settings
                      </h2>
                      <p className="font-body text-xs sm:text-sm text-surface-500 mt-0.5">
                        Configure today&apos;s OPD registration window and rules
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">
                        Session Date (Day of Visit)
                      </label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">
                        Notice for Patients
                      </label>
                      <input
                        type="text"
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder="e.g. General OPD — Fever & Consultation"
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">
                        Patients Per Hour (Slot Capacity)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={formPatientsPerHour}
                          onChange={(e) =>
                            setFormPatientsPerHour(
                              parseInt(e.target.value, 10) || 10,
                            )
                          }
                          className="input-field w-32 border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm font-bold"
                        />
                        <span className="font-body text-xs text-surface-500 font-medium">
                          patients maximum allowed per 1-hour time slot
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Save Settings Button */}
                    <div className="sm:col-span-2 flex items-center justify-between border-t border-surface-200/60 pt-4">
                      <div className="text-xs font-body font-medium text-surface-500">
                        {isSettingsDirty ? (
                          <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Unsaved schedule changes
                          </span>
                        ) : (
                          <span>All settings are saved</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings || loading}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 disabled:opacity-60 text-white font-body font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/20 cursor-pointer"
                      >
                        {isSavingSettings ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Save Settings</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Doctor Delay / Running Late Management Card */}
                    <div className="sm:col-span-2 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border border-amber-200/90 rounded-2xl p-5 shadow-xs">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                          <Clock size={20} />
                        </div>
                        <div>
                          <h3 className="font-display text-base font-extrabold text-slate-900">
                            Doctor Delay Management
                          </h3>
                          <p className="font-body text-xs text-slate-600 font-medium">
                            If doctor is late, set delay duration. Time slots on patient portal automatically adjust (+30 mins, +1 hour, etc.).
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {[
                          { label: "🟢 On Time (0m)", minutes: 0 },
                          { label: "⏱️ +15 Mins", minutes: 15 },
                          { label: "⏱️ +30 Mins", minutes: 30 },
                          { label: "⏱️ +45 Mins", minutes: 45 },
                          { label: "⏱️ +1 Hour", minutes: 60 },
                          { label: "⏱️ +1.5 Hours", minutes: 90 },
                          { label: "⏱️ +2 Hours", minutes: 120 },
                        ].map((preset) => {
                          const isSelected = regWindow.delayMinutes === preset.minutes;
                          return (
                            <button
                              key={preset.minutes}
                              type="button"
                              onClick={() => setRegWindow({ delayMinutes: preset.minutes })}
                              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400/30"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                              <span>{preset.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {regWindow.delayMinutes > 0 && (
                        <div className="mt-4 bg-amber-100/90 border border-amber-300/80 rounded-xl p-3 text-xs text-amber-900 font-bold flex items-center justify-between">
                          <span>
                            ⚠️ Active Schedule Shift: All patient booking slots are currently shifted by +{formatDelayText(regWindow.delayMinutes)}.
                          </span>
                          <button
                            type="button"
                            onClick={() => setRegWindow({ delayMinutes: 0 })}
                            className="text-amber-800 underline hover:text-amber-950 font-extrabold ml-2 shrink-0 cursor-pointer"
                          >
                            Reset to 0m
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleRegistration(!regWindow.isOpen)}
                  disabled={loading}
                  className={`w-fit mx-auto rounded-2xl px-8 py-3.5 font-body font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed ${
                    regWindow.isOpen
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                      : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <>
                      {regWindow.isOpen ? (
                        <Square size={20} />
                      ) : (
                        <Play size={20} />
                      )}
                      {regWindow.isOpen
                        ? "Close Registration Now"
                        : "Open Registration Now"}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Completed Patients Modal */}
      {showCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-surface-200 flex flex-col max-h-[85vh] animate-slide-up">
            <div className="p-5 sm:p-6 border-b border-surface-100 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-surface-900">
                  Completed Patients
                </h2>
                <p className="font-body text-sm text-surface-500 mt-0.5">
                  {done.length} patients seen today
                </p>
              </div>
              <button
                onClick={() => setShowCompletedModal(false)}
                className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-surface-500" />
              </button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto">
              {done.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} className="text-surface-400" />
                  </div>
                  <p className="font-body text-sm text-surface-500">
                    No completed patients yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {done.map((p) => (
                    <div
                      key={p.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-mono-custom font-bold text-sm sm:text-base shrink-0">
                          {p.token_number}
                        </div>
                        <div className="min-w-0">
                          <p className="font-body font-bold text-surface-900 text-sm sm:text-base truncate">
                            {p.name}
                          </p>
                          <p className="font-body text-xs text-surface-500 font-medium">
                            {p.age}y · {p.gender} · {p.phone}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 font-body font-bold uppercase tracking-wider">
                          Done
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completed Walk-in Patients Modal */}
      {showWalkinCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-surface-200 flex flex-col max-h-[85vh] animate-slide-up">
            <div className="p-5 sm:p-6 border-b border-surface-100 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-surface-900">
                  Completed Walk-in Patients
                </h2>
                <p className="font-body text-sm text-surface-500 mt-0.5">
                  {walkinDone.length} walk-in patients seen today
                </p>
              </div>
              <button
                onClick={() => setShowWalkinCompletedModal(false)}
                className="p-2 hover:bg-surface-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} className="text-surface-500" />
              </button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto">
              {walkinDone.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} className="text-surface-400" />
                  </div>
                  <p className="font-body text-sm text-surface-500">
                    No completed walk-in patients yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {walkinDone.map((p) => (
                    <div
                      key={p.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-mono-custom font-bold text-xs sm:text-sm shrink-0 border border-amber-200">
                          {p.walkin_token_display || `W-${p.token_number}`}
                        </div>
                        <div className="min-w-0">
                          <p className="font-body font-bold text-surface-900 text-sm sm:text-base truncate">
                            {p.name}
                          </p>
                          <p className="font-body text-xs text-surface-500 font-medium">
                            {p.age}y · {p.gender} · {p.phone}
                          </p>
                          {p.city_village && (
                            <p className="font-body text-[11px] text-surface-400">
                              📍 {p.city_village}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 font-body font-bold uppercase tracking-wider">
                          Done
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Patient Time Slot Modal */}
      {reschedulePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-surface-200 flex flex-col max-h-[90vh] animate-slide-up overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-surface-100 flex items-start justify-between bg-linear-to-r from-brand-50/70 via-surface-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 shadow-xs">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-surface-900 leading-tight">
                    Update Patient Time Slot
                  </h2>
                  <p className="font-body text-xs text-surface-500 mt-0.5">
                    Reschedule patient to an alternate OPD slot
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReschedulePatient(null)}
                disabled={isUpdatingSlot}
                className="p-2 hover:bg-surface-200/60 rounded-xl transition-colors text-surface-400 hover:text-surface-700 cursor-pointer disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Patient Snapshot Card */}
              <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center font-mono-custom font-extrabold text-base shrink-0 shadow-sm">
                    {reschedulePatient.slot_token_number || reschedulePatient.token_number}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body font-bold text-surface-900 text-sm sm:text-base truncate">
                      {reschedulePatient.name}
                    </p>
                    <p className="font-body text-xs text-surface-600 font-medium">
                      {reschedulePatient.age}y · {reschedulePatient.gender} · {reschedulePatient.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white text-surface-700 border-surface-200 font-body font-bold uppercase tracking-wider block mb-1">
                    {reschedulePatient.status}
                  </span>
                  {reschedulePatient.time_slot && (
                    <span className="text-[10px] font-mono-custom text-surface-500">
                      Current: {reschedulePatient.time_slot}
                    </span>
                  )}
                </div>
              </div>

              {/* Slots List */}
              <div>
                <label className="block font-body text-xs font-bold text-surface-700 uppercase tracking-wider mb-2.5">
                  Select New Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => {
                    const isCurrent = reschedulePatient.time_slot === slot;
                    const isSelected = selectedNewSlot === slot;
                    const inSlotCount = patients.filter(
                      (p) => p.time_slot === slot && p.id !== reschedulePatient.id
                    ).length;
                    const capacity = regWindow.patientsPerHour || 10;
                    const isFull = inSlotCount >= capacity;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedNewSlot(slot)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2 active:scale-98 ${
                          isSelected
                            ? "bg-brand-50 border-brand-500 shadow-sm ring-2 ring-brand-500/20"
                            : "bg-white hover:bg-surface-50 border-surface-200 hover:border-surface-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`font-mono-custom text-xs font-bold leading-tight ${
                              isSelected ? "text-brand-900" : "text-surface-900"
                            }`}
                          >
                            {slot}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                              <Check size={11} strokeWidth={3} />
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] gap-2">
                          <span
                            className={`font-body font-medium ${
                              isFull ? "text-amber-600 font-bold" : "text-surface-500"
                            }`}
                          >
                            {inSlotCount}/{capacity} booked
                          </span>
                          {isCurrent ? (
                            <span className="text-[10px] bg-surface-100 text-surface-600 font-bold px-1.5 py-0.5 rounded-md">
                              Current
                            </span>
                          ) : isFull ? (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-1.5 py-0.5 rounded-md">
                              Full
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.5 rounded-md">
                              Available
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skipped Status Option */}
              {reschedulePatient.status === "skipped" && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetStatusToWaiting}
                    onChange={(e) => setResetStatusToWaiting(e.target.checked)}
                    className="mt-0.5 rounded border-amber-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-amber-900">
                      Reset patient status to &ldquo;Waiting&rdquo;
                    </p>
                    <p className="text-amber-700 font-medium">
                      Patient will be re-added to the active queue for the selected slot.
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-surface-100 flex items-center justify-end gap-3 bg-surface-50/60">
              <button
                type="button"
                onClick={() => setReschedulePatient(null)}
                disabled={isUpdatingSlot}
                className="px-4 py-2.5 rounded-xl font-body font-bold text-xs sm:text-sm text-surface-600 hover:text-surface-900 hover:bg-surface-200/70 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={
                  isUpdatingSlot ||
                  !selectedNewSlot ||
                  (selectedNewSlot === reschedulePatient.time_slot &&
                    !(reschedulePatient.status === "skipped" && resetStatusToWaiting))
                }
                className="px-5 py-2.5 rounded-xl font-body font-bold text-xs sm:text-sm bg-brand-600 hover:bg-brand-700 active:scale-98 text-white transition-all shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isUpdatingSlot ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Confirm New Slot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
