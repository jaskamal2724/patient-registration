"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDoctor } from "@/lib/useDoctor";
import type { Doctor } from "@/lib/types";
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
  UserCheck,
  TrendingUp,
  X,
  Edit3,
} from "lucide-react";
import InstallPWA from "./InstallPWA";
import LogiquelAdCard from "./LogiquelAdCard";

type Tab = "queue" | "settings";

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
      className={`bg-white rounded-2xl p-3 sm:p-4 card-lift shadow-sm border border-surface-200 stagger-item ${onClick ? "cursor-pointer hover:border-brand-200 hover:shadow-md transition-all ring-2 ring-transparent hover:ring-brand-100" : ""}`}
      onClick={onClick}
    >
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${bgLight}`}
      >
        <Icon size={16} className={color} />
      </div>
      <p className="font-mono-custom text-xl sm:text-3xl font-bold text-surface-900 mb-0.5">
        {value}
      </p>
      <p className="font-body text-[10px] sm:text-xs text-surface-500 uppercase tracking-wider font-medium leading-tight">
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
    callNext,
    markDone,
    skipPatient,
    currentToken,
    loading,
    toast,
  } = useDoctor(doctor);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("queue");
  const [editName, setEditName] = useState(false);
  const [tempName, setTempName] = useState(doctorName);
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const waiting = patients.filter((p) => p.status === "waiting");
  const inProgress = patients.find((p) => p.status === "in-progress");
  const done = patients.filter((p) => p.status === "done");

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
    <div className="min-h-screen bg-surface-50 max-w-full overflow-x-hidden">
      <div className="flex min-h-screen max-w-full overflow-x-hidden">
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
                MediQueue
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
                Seeing: Token #{inProgress.token_number}
              </p>
            )}
          </div>

          <nav className="space-y-1.5 flex-1">
            {(
              [
                ["queue", "Dashboard", Users],
                ["settings", "Settings", Settings],
              ] as [Tab, string, any][]
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all ${
                  tab === id
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                }`}
              >
                <Icon size={18} />
                {label}
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
        <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
              <Stethoscope size={16} className="text-white" />
            </div>
            <div className="flex flex-col items-start gap-0.5 min-w-0">
              <span className="font-display font-bold text-surface-900 leading-none text-sm">
                MediQueue
              </span>
              <InstallPWA />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <div
              className={`flex items-center gap-1.5 text-[10px] font-body font-semibold px-2.5 py-1 rounded-full border ${regWindow.isOpen ? "bg-brand-50 text-brand-700 border-brand-200" : "bg-surface-100 text-surface-500 border-surface-200"}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${regWindow.isOpen ? "bg-brand-500 status-live" : "bg-surface-400"}`}
              />
              {regWindow.isOpen ? "Open" : "Closed"}
            </div>
            <button
              onClick={handleLogout}
              className="text-surface-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
          <div className="p-4 sm:p-5 lg:p-8 max-w-5xl mx-auto">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 mt-2 lg:mt-8 gap-4">
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

              {/* Registration Toggle Button */}
              <button
                onClick={() => toggleRegistration(!regWindow.isOpen)}
                disabled={loading}
                className={`w-fit flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-body text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed ${
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
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

            {/* Segmented Mobile Tabs */}
            <div className="flex lg:hidden gap-1 bg-surface-200/60 backdrop-blur-xs rounded-2xl p-1 mb-6 border border-surface-200/80">
              {(["queue", "settings"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3 rounded-xl font-body text-xs sm:text-sm font-bold capitalize transition-all flex items-center justify-center gap-2 ${
                    tab === t
                      ? "bg-white text-surface-900 shadow-md shadow-surface-900/5 border border-surface-200/50"
                      : "text-surface-600 hover:text-surface-900"
                  }`}
                >
                  {t === "queue" ? (
                    <>
                      <Users size={16} />
                      Queue ({waiting.length})
                    </>
                  ) : (
                    <>
                      <Settings size={16} />
                      Settings
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Queue Tab */}
            {tab === "queue" && (
              <div className="space-y-6">
                {/* Currently Seeing Banner */}
                {inProgress && (
                  <div className="bg-linear-to-br from-brand-600 to-accent-600 rounded-3xl p-5 sm:p-6 lg:p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-4 sm:gap-6">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full backdrop-blur-xs mb-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <p className="font-body text-white text-[11px] uppercase tracking-widest font-extrabold">
                            Currently Seeing
                          </p>
                        </div>
                        <p className="font-display text-4xl sm:text-5xl font-extrabold mb-1.5 tracking-tight">
                          Token #
                          {inProgress.slot_token_number ||
                            inProgress.token_number}
                        </p>
                        <p className="font-body text-white font-bold text-base sm:text-lg truncate">
                          {inProgress.name} · {inProgress.age}y ·{" "}
                          {inProgress.gender}
                        </p>
                        {inProgress.time_slot && (
                          <p className="font-body text-brand-100 text-xs sm:text-sm mt-1 truncate font-medium">
                            Slot: {inProgress.time_slot}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-md border border-white/20 shrink-0 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <UserCheck size={20} className="text-white" />
                        </div>
                        <button
                          onClick={() => markDone(inProgress.id)}
                          className="bg-white hover:bg-brand-50 active:scale-98 text-brand-700 border border-transparent rounded-xl px-5 py-2.5 font-body font-bold text-sm transition-all shadow-md flex-1 sm:flex-none text-center"
                        >
                          Mark as Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Call Next Button Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-surface-200 shadow-xs">
                  <div>
                    <h2 className="font-display text-lg font-bold text-surface-900 flex items-center gap-2">
                      Dasbhoard
                      <span className="font-body text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                        {waiting.length} waiting
                      </span>
                    </h2>
                    {inProgress && (
                      <p className="text-xs font-body text-amber-600 font-medium mt-0.5">
                        Mark Token #
                        {inProgress.slot_token_number ||
                          inProgress.token_number}{" "}
                        as done to call next
                      </p>
                    )}
                  </div>
                  <button
                    onClick={callNext}
                    disabled={waiting.length === 0 || !!inProgress || loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface-900 hover:bg-surface-800 disabled:bg-surface-100 disabled:text-surface-400 disabled:cursor-not-allowed text-white text-sm font-body font-bold px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-98 whitespace-nowrap"
                  >
                    <span>Call Next Patient</span>
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Patient List */}
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                  {patients.length === 0 ? (
                    <div className="text-center py-14 sm:py-20 px-4">
                      <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Users size={24} className="text-surface-400" />
                      </div>
                      <p className="font-display text-base font-bold text-surface-900 mb-1">
                        Queue is empty
                      </p>
                      <p className="font-body text-xs text-surface-500 max-w-xs mx-auto">
                        No patients registered for today yet.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-100">
                      {patients.map((p) => (
                        <div
                          key={p.id}
                          className={`p-4 transition-all hover:bg-surface-50 ${
                            p.status === "done" || p.status === "skipped"
                              ? "bg-surface-50/50 opacity-60"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-mono-custom font-extrabold text-base shrink-0 shadow-xs ${
                                  p.status === "in-progress"
                                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                                    : p.status === "done"
                                      ? "bg-surface-200 text-surface-500"
                                      : p.status === "skipped"
                                        ? "bg-red-100 text-red-500"
                                        : "bg-brand-50 text-brand-700 border border-brand-200/80"
                                }`}
                              >
                                #{p.slot_token_number || p.token_number}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
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
                                <p className="font-body text-xs text-surface-600 font-semibold mb-1">
                                  {p.age}y · {p.gender} ·{" "}
                                  <a
                                    href={`tel:${p.phone}`}
                                    className="text-brand-600 underline underline-offset-2 hover:text-brand-800"
                                  >
                                    {p.phone}
                                  </a>
                                </p>
                                {p.time_slot && (
                                  <span className="inline-block text-[11px] font-mono-custom font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100">
                                    {p.time_slot}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-2 shrink-0">
                              <span className="font-mono-custom text-[11px] font-medium text-surface-400 bg-surface-100/70 px-2 py-0.5 rounded-md">
                                {new Date(p.registered_at).toLocaleTimeString(
                                  "en-IN",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                              {p.status === "waiting" && (
                                <button
                                  onClick={() => skipPatient(p.id)}
                                  className="flex items-center gap-1 text-xs font-bold text-surface-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors border border-surface-200"
                                >
                                  <SkipForward size={12} />
                                  Skip
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
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
                        Configure today's OPD registration window and rules
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
                        value={regWindow.date || ""}
                        onChange={(e) => setRegWindow({ date: e.target.value })}
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={regWindow.startTime || ""}
                        onChange={(e) =>
                          setRegWindow({ startTime: e.target.value })
                        }
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={regWindow.endTime || ""}
                        onChange={(e) =>
                          setRegWindow({ endTime: e.target.value })
                        }
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">
                        Notice for Patients
                      </label>
                      <input
                        type="text"
                        value={regWindow.message}
                        onChange={(e) =>
                          setRegWindow({ message: e.target.value })
                        }
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
                          value={regWindow.patientsPerHour ?? 10}
                          onChange={(e) =>
                            setRegWindow({
                              patientsPerHour: parseInt(e.target.value, 10) || 10,
                            })
                          }
                          className="input-field w-32 border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm font-bold"
                        />
                        <span className="font-body text-xs text-surface-500 font-medium">
                          patients maximum allowed per 1-hour time slot
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 bg-surface-50 border border-surface-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-body text-sm font-bold text-surface-900">
                          Auto-close Registration at 10:00 AM
                        </p>
                        <p className="font-body text-xs text-surface-500 mt-0.5 font-medium">
                          Automatically closes registration at 10:00 AM on visit day. Disable this to control registration manually anytime.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setRegWindow({ autoClose10AM: !regWindow.autoClose10AM })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          regWindow.autoClose10AM ? "bg-brand-600" : "bg-surface-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            regWindow.autoClose10AM
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
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
                          #{p.token_number}
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

      <Toast toast={toast} />
    </div>
  );
}
