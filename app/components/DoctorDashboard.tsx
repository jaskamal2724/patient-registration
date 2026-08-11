"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDoctor } from "@/lib/useDoctor";
import type { Doctor } from "@/lib/types";
import Toast from "./Toast";
import {
  Stethoscope, LogOut, Users, Clock, CheckCircle2, SkipForward,
  Play, Square, ChevronRight, Settings, Calendar, UserCheck,
  TrendingUp, X, Edit3
} from "lucide-react";
import InstallPWA from "./InstallPWA";

type Tab = "queue" | "settings";

function StatCard({ label, value, icon: Icon, color, bgLight }: { label: string; value: number | string; icon: any; color: string; bgLight: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 card-lift shadow-sm border border-surface-200 stagger-item">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bgLight}`}>
        <Icon size={20} className={color} />
      </div>
      <p className="font-mono-custom text-3xl font-bold text-surface-900 mb-1">{value}</p>
      <p className="font-body text-xs text-surface-500 uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

export default function DoctorDashboard({ doctor }: { doctor: Doctor }) {
  const {
    doctorName, setDoctorName,
    logout,
    regWindow, setRegWindow, toggleRegistration,
    patients, callNext, markDone, skipPatient, currentToken, loading,
    toast
  } = useDoctor(doctor);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("queue");
  const [editName, setEditName] = useState(false);
  const [tempName, setTempName] = useState(doctorName);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const waiting = patients.filter(p => p.status === "waiting");
  const inProgress = patients.find(p => p.status === "in-progress");
  const done = patients.filter(p => p.status === "done");

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
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar + Main layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-surface-200 p-6 fixed h-full z-10 shadow-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
              <Stethoscope size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-surface-900 leading-tight">MediQueue</p>
              <p className="text-brand-600 text-xs font-body font-medium mb-1.5">Doctor Panel</p>
              <InstallPWA />
            </div>
          </div>

          {/* Live status */}
          <div className={`rounded-2xl p-4 mb-8 border transition-colors ${regWindow.isOpen ? "bg-brand-50 border-brand-200" : "bg-surface-50 border-surface-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${regWindow.isOpen ? "bg-brand-500 status-live" : "bg-surface-400"}`} />
              <span className={`font-body text-xs font-semibold ${regWindow.isOpen ? "text-brand-700" : "text-surface-500"}`}>
                {regWindow.isOpen ? "Registration Open" : "Registration Closed"}
              </span>
            </div>
            {inProgress && (
              <p className="text-brand-600 text-xs font-body font-medium">Seeing: Token #{inProgress.token_number}</p>
            )}
          </div>

          {/* Nav */}
          <nav className="space-y-1.5 flex-1">
            {([["queue", "Patient Queue", Users], ["settings", "Session Settings", Settings]] as [Tab, string, any][]).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all ${
                  tab === id ? "bg-brand-600 text-white shadow-md shadow-brand-500/20" : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          {/* Doctor info */}
          <div className="border-t border-surface-200 pt-4 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-display text-sm font-bold text-brand-700">
                {doctorName.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-body text-sm font-bold text-surface-900 truncate">{doctorName}</p>
                <p className="text-surface-500 text-xs font-medium">General Physician</p>
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
        <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-surface-200 px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
              <Stethoscope size={16} className="text-white" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-display font-bold text-surface-900 leading-none">MediQueue</span>
              <InstallPWA />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-2.5 h-2.5 rounded-full ${regWindow.isOpen ? "bg-brand-500 status-live" : "bg-surface-400"}`} />
            <button onClick={handleLogout} className="text-surface-500 hover:text-red-600">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-20 lg:pt-0">
          <div className="p-5 lg:p-8 max-w-5xl mx-auto">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 mt-2 lg:mt-8 gap-4">
              <div>
                {editName ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="input-field border border-brand-300 rounded-xl px-3 py-1.5 font-display text-2xl font-bold text-surface-900 bg-white shadow-sm"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onBlur={() => { setDoctorName(tempName); setEditName(false); }}
                      onKeyDown={e => e.key === "Enter" && (setDoctorName(tempName), setEditName(false))}
                      autoFocus
                    />
                    <button onClick={() => setEditName(false)} className="p-1.5 hover:bg-surface-200 rounded-lg">
                      <X size={18} className="text-surface-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditName(true)}>
                    <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight">{doctorName}</h1>
                    <div className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-surface-200 transition-all">
                      <Edit3 size={16} className="text-surface-400" />
                    </div>
                  </div>
                )}
                <p className="font-body text-sm text-surface-500 mt-1 font-medium">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              {/* Toggle Registration */}
              <button
                onClick={() => toggleRegistration(!regWindow.isOpen)}
                disabled={loading}
                className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-body text-sm font-semibold transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
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
                    {regWindow.isOpen ? <Square size={16} /> : <Play size={16} />}
                    <span>{regWindow.isOpen ? "Close Registration" : "Open Registration"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <StatCard label="Total Patients" value={patients.length} icon={Users} color="text-brand-600" bgLight="bg-brand-50" />
              <StatCard label="Waiting" value={waiting.length} icon={Clock} color="text-amber-600" bgLight="bg-amber-50" />
              <StatCard label="Completed" value={done.length} icon={CheckCircle2} color="text-emerald-600" bgLight="bg-emerald-50" />
              <StatCard label="Current Token" value={currentToken || "—"} icon={TrendingUp} color="text-accent-600" bgLight="bg-accent-50" />
            </div>

            {/* Tabs (mobile) */}
            <div className="flex lg:hidden gap-1 bg-surface-200/50 rounded-xl p-1 mb-6">
              {(["queue", "settings"] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded-lg font-body text-sm font-semibold capitalize transition-all ${
                    tab === t ? "bg-white text-surface-900 shadow-sm" : "text-surface-500"
                  }`}
                >
                  {t === "queue" ? "Queue" : "Settings"}
                </button>
              ))}
            </div>

            {/* Queue Tab */}
            {(tab === "queue" || window?.innerWidth >= 1024) && (
              <div className={tab !== "queue" ? "hidden lg:block" : ""}>
                {/* Currently Seeing */}
                {inProgress && (
                  <div className="bg-linear-to-br from-brand-600 to-accent-600 rounded-3xl p-6 lg:p-8 mb-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-6">
                      <div>
                        <p className="font-body text-brand-100 text-xs uppercase tracking-widest font-semibold mb-2">Currently Seeing</p>
                        <p className="font-display text-5xl font-extrabold mb-2 tracking-tight">Token #{inProgress.token_number}</p>
                        <p className="font-body text-white font-medium text-lg">{inProgress.name} · {inProgress.age}y · {inProgress.gender}</p>
                        <p className="font-body text-brand-100 text-sm mt-1">{inProgress.reason}</p>
                      </div>
                      <div className="flex sm:flex-col items-center gap-4 sm:gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <UserCheck size={24} className="text-white" />
                        </div>
                        <button
                          onClick={() => markDone(inProgress.id)}
                          className="bg-white text-brand-700 hover:bg-brand-50 border border-transparent rounded-xl px-5 py-2.5 font-body font-bold text-sm transition-all shadow-sm flex-1 sm:flex-none"
                        >
                          Mark as Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Call Next */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                  <h2 className="font-display text-xl font-bold text-surface-900">
                    Patient Queue <span className="font-body text-sm text-surface-500 font-medium ml-2 bg-surface-100 px-2.5 py-1 rounded-full">{waiting.length} waiting</span>
                  </h2>
                  <button
                    onClick={callNext}
                    disabled={waiting.length === 0}
                    className="flex items-center justify-center gap-2 bg-surface-900 hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-body font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    <span>Call Next Patient</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Patient List */}
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                  {patients.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-surface-400" />
                      </div>
                      <p className="font-display text-lg font-bold text-surface-900 mb-1">Queue is empty</p>
                      <p className="font-body text-sm text-surface-500">No patients registered for today yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-100">
                      {patients.map((p, i) => (
                        <div
                          key={p.id}
                          className={`p-4 transition-all hover:bg-surface-50 ${
                            p.status === "done" || p.status === "skipped" ? "bg-surface-50/50 opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Token number */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono-custom font-bold text-base shrink-0 ${
                              p.status === "in-progress" ? "bg-brand-600 text-white shadow-md shadow-brand-500/20" :
                              p.status === "done" ? "bg-surface-200 text-surface-500" :
                              p.status === "skipped" ? "bg-red-100 text-red-500" :
                              "bg-brand-50 text-brand-700 border border-brand-100"
                            }`}>
                              #{p.token_number}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <p className="font-body font-bold text-surface-900 text-base truncate">{p.name}</p>
                                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-body font-semibold uppercase tracking-wider ${statusBadge(p.status)}`}>
                                  {p.status === "in-progress" ? "In Progress" : p.status}
                                </span>
                              </div>
                              <p className="font-body text-xs text-surface-500 font-medium">
                                {p.age}y · {p.gender} · {p.phone} <span className="text-surface-300 mx-1">|</span> {p.reason}
                              </p>
                            </div>

                            {/* Time & Actions */}
                            <div className="text-right flex flex-col items-end gap-2 shrink-0">
                              <p className="font-mono-custom text-xs font-medium text-surface-400">
                                {new Date(p.registered_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                              {p.status === "waiting" && (
                                <button
                                  onClick={() => skipPatient(p.id)}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-surface-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors"
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
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 lg:p-8 mb-6">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-surface-100">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                      <Calendar size={22} className="text-brand-600" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-surface-900">Session Settings</h2>
                      <p className="font-body text-sm text-surface-500 mt-1">Configure today's OPD registration window and rules</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">Session Date</label>
                      <input
                        type="date"
                        value={regWindow.date || ""}
                        onChange={e => setRegWindow({ ...regWindow, date: e.target.value })}
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">Max Patients</label>
                      <input
                        type="number"
                        min={1} max={100}
                        value={regWindow.maxPatients}
                        onChange={e => setRegWindow({ ...regWindow, maxPatients: +e.target.value })}
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">Start Time</label>
                      <input
                        type="time"
                        value={regWindow.startTime || ""}
                        onChange={e => setRegWindow({ ...regWindow, startTime: e.target.value })}
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">End Time</label>
                      <input
                        type="time"
                        value={regWindow.endTime || ""}
                        onChange={e => setRegWindow({ ...regWindow, endTime: e.target.value })}
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-body text-xs font-semibold text-surface-700 uppercase tracking-wide mb-2 block">Notice for Patients</label>
                      <input
                        type="text"
                        value={regWindow.message}
                        onChange={e => setRegWindow({ ...regWindow, message: e.target.value })}
                        placeholder="e.g. Morning OPD — Fever & General"
                        className="input-field w-full border border-surface-200 rounded-xl px-4 py-3 font-body text-sm bg-surface-50 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Toggle Registration big button */}
                <button
                  onClick={() => toggleRegistration(!regWindow.isOpen)}
                  disabled={loading}
                  className={`w-full rounded-2xl py-4 font-body font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
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
                      {regWindow.isOpen ? <Square size={20} /> : <Play size={20} />}
                      {regWindow.isOpen ? "Close Registration Now" : "Open Registration Now"}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
