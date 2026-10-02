"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import {
  User,
  Phone,
  Calendar,
  Clock,
  Ticket,
  CheckCircle2,
  Download,
  Share2,
  Shield,
  ArrowRight,
  ChevronRight,
  Search,
  AlertCircle,
  Sparkles,
  MapPin,
  Stethoscope,
  HeartPulse,
  QrCode,
  Camera,
} from "lucide-react";
import * as api from "@/lib/api";
import { createBrowserClient } from "@/lib/supabase";
import type { Doctor, WalkinPatient } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import DocCareLogo from "./DocCareLogo";
import InstallPWA from "./InstallPWA";
import LanguageSelector from "./LanguageSelector";
import LogiquelAdCard from "./LogiquelAdCard";
import LoadingScreen from "./LoadingScreen";

const supabase = createBrowserClient();

export default function WalkinPatientPortal() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [walkinPatients, setWalkinPatients] = useState<WalkinPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [step, setStep] = useState<"home" | "form" | "success">("home");

  // Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [phone, setPhone] = useState("");
  const [cityVillage, setCityVillage] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Success / Registered Patient State
  const [registeredPatient, setRegisteredPatient] = useState<WalkinPatient | null>(null);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchPhone, setSearchPhone] = useState("");
  const [searchResult, setSearchResult] = useState<WalkinPatient | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);

  // Fetch active doctor & walkin patients + Supabase Realtime
  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const timer = setTimeout(() => {
      if (!cancelled) setInitialLoading(false);
    }, 1000);

    const load = async () => {
      try {
        const { doctor: doc } = await api.fetchActiveDoctor();
        if (cancelled) return;
        setDoctor(doc);

        if (doc?.id) {
          const list = await api.fetchWalkinPatients(doc.id);
          if (!cancelled) {
            setWalkinPatients(list);
            setInitialLoading(false);
          }

          if (!channel) {
            channel = supabase
              .channel(`walkin-portal-${doc.id}`)
              .on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "walkin_patients",
                },
                async () => {
                  const updated = await api.fetchWalkinPatients(doc.id).catch(() => []);
                  if (!cancelled) setWalkinPatients(updated);
                }
              )
              .subscribe();
          }
        } else {
          if (!cancelled) setInitialLoading(false);
        }
      } catch {
        if (!cancelled) setInitialLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError(language === "hi" ? "कृपया मरीज का नाम दर्ज करें।" : "Please enter patient name.");
      return;
    }

    if (!age || isNaN(+age) || +age < 1 || +age > 120) {
      setFormError(language === "hi" ? "कृपया सही उम्र दर्ज करें (1-120)।" : "Please enter a valid age (1-120).");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setFormError(language === "hi" ? "कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const newPatient = await api.addWalkinPatient(doctor?.id || "", {
        name: name.trim(),
        age: String(age),
        gender,
        phone: cleanPhone,
        city_village: cityVillage.trim(),
        reason: reason.trim(),
      });

      setRegisteredPatient(newPatient);
      setWalkinPatients((prev) => [...prev, newPatient]);
      setStep("success");
      // Reset form
      setName("");
      setAge("");
      setPhone("");
      setCityVillage("");
      setReason("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to register walk-in patient");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchPhone.replace(/\D/g, "");
    if (clean.length < 10) return;

    const found = walkinPatients.find((p) => p.phone.replace(/\D/g, "") === clean);
    if (found) {
      setSearchResult(found);
      setSearchNotFound(false);
    } else {
      setSearchResult(null);
      setSearchNotFound(true);
    }
  };

  const handleDownloadTicket = async () => {
    if (!ticketRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `Walkin-Token-${registeredPatient?.walkin_token_display || registeredPatient?.token_number}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!registeredPatient) return;
    const tokenDisplay = registeredPatient.walkin_token_display || `W-${registeredPatient.token_number}`;
    const text =
      language === "hi"
        ? `🏥 *डॉ. सर्वेश ओपीडी - वॉक-इन टोकन*\n👤 मरीज: *${registeredPatient.name}*\n🎫 वॉक-इन टोकन: *${tokenDisplay}*\n📱 फोन: ${registeredPatient.phone}\n📍 क्लिनिक पर स्वागत है!`
        : `🏥 *Doctor Sarvesh OPD - Walk-in Token*\n👤 Patient: *${registeredPatient.name}*\n🎫 Walk-in Token: *${tokenDisplay}*\n📱 Phone: ${registeredPatient.phone}\n📍 Welcome to the clinic!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (initialLoading) {
    return <LoadingScreen />;
  }

  const inProgressWalkin = walkinPatients.find((p) => p.status === "in-progress");
  const waitingWalkinCount = walkinPatients.filter((p) => p.status === "waiting").length;

  return (
    <div className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between">
      {/* Header */}
      <header className="relative z-10 flex items-start justify-between px-4 sm:px-6 py-4 max-w-md sm:max-w-xl w-full mx-auto gap-2">
        <div className="flex flex-col gap-1.5">
          <DocCareLogo variant="header" subtitle={t("walkinPortal")} />
          <div className="flex items-center gap-2 flex-wrap">
            <InstallPWA />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <LanguageSelector />
          <button
            onClick={() => {
              if (step === "form") setStep("home");
              else if (step === "success") setStep("home");
              else router.push("/");
            }}
            className="inline-flex items-center justify-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200/90 rounded-full px-3 py-1 mr-1 sm:mr-1.5 shadow-2xs transition-all cursor-pointer"
          >
            {t("exit")}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-8 flex-1">
        {step === "home" && (
          <div className="animate-fade-in space-y-5 text-left">
            {/* Top Walk-in Hero Card */}
            <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
              {/* Doctor Tag */}
              <div className="inline-flex items-center gap-1 bg-[#EBF3FF] border border-[#D0E2FF] text-[#1D68F3] rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide mb-3 shadow-2xs">
                <Calendar size={12} className="text-[#1D68F3] shrink-0" />
                <span>{t("doctorName")}</span>
              </div>

              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-2.5 py-1 text-[11px] font-extrabold mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t("walkinBadge")}</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B1527] tracking-tight leading-snug mb-1.5 whitespace-pre-line">
                    {t("walkinTitle")}
                  </h2>
                  <p className="font-body text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-4">
                    {t("walkinSubtitle")}
                  </p>

                  <button
                    onClick={() => setStep("form")}
                    className="bg-[#1D68F3] hover:bg-[#1554C6] text-white font-display font-extrabold text-sm sm:text-base px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <HeartPulse size={18} className="shrink-0" />
                    <span>{t("getWalkinToken")}</span>
                    <ArrowRight size={16} className="shrink-0" />
                  </button>
                </div>

                {/* Right Icon Illustration */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center p-3 shrink-0 shadow-inner">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-1.5">
                    <Ticket size={20} />
                  </div>
                  <span className="text-[10px] font-mono-custom font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                    WALK-IN
                  </span>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="bg-[#F4F8FF] border border-blue-100/80 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <AlertCircle size={15} className="text-blue-600 shrink-0" />
                <span>{t("walkinTokenNotice")}</span>
              </div>
            </div>

            {/* Live Walkin Queue Status Card */}
            <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5">
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t("liveQueue")}
                </h3>
                <span className="text-xs font-bold font-mono-custom text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {waitingWalkinCount} {language === "hi" ? "प्रतीक्षारत" : "Waiting"}
                </span>
              </div>

              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-4 text-white shadow-md shadow-blue-500/20">
                <p className="font-body text-[11px] font-bold text-blue-100 uppercase tracking-widest mb-1">
                  {t("doctorSeeingTitle")}
                </p>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono-custom text-3xl sm:text-4xl font-black text-white leading-none">
                    {inProgressWalkin ? inProgressWalkin.walkin_token_display || inProgressWalkin.token_number : (language === "hi" ? "सत्र प्रारंभ..." : "Session In Progress")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {t("inConsultation")}
                  </span>
                </div>
                {inProgressWalkin && (
                  <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between gap-2">
                    <p className="font-body text-sm sm:text-base font-extrabold text-white truncate">
                      {inProgressWalkin.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Search Walk-in Token Card */}
            <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-6 shadow-xl shadow-blue-900/5">
              <h3 className="font-display text-base font-extrabold text-slate-900 mb-1">
                {t("searchWalkinTokenTitle")}
              </h3>
              <p className="font-body text-xs text-slate-500 font-medium mb-3">
                {t("searchWalkinTokenSubtitle")}
              </p>

              <form onSubmit={handleSearchPhone} className="flex gap-2">
                <input
                  type="tel"
                  placeholder={t("enterMobilePlaceholder")}
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom"
                />
                <button
                  type="submit"
                  disabled={searchPhone.length < 10}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <Search size={14} />
                </button>
              </form>

              {searchResult && (
                <div
                  onClick={() => {
                    setRegisteredPatient(searchResult);
                    setStep("success");
                  }}
                  className="mt-3 bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-blue-100/70 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono-custom font-bold text-base shrink-0">
                      {searchResult.walkin_token_display || searchResult.token_number}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-sm font-extrabold text-slate-900 truncate">
                        {searchResult.name}
                      </p>
                      <p className="font-body text-xs text-slate-500">
                        {searchResult.age}y · {searchResult.gender}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1 shrink-0">
                    {t("viewTicket")}
                    <ChevronRight size={14} />
                  </span>
                </div>
              )}

              {searchNotFound && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-medium">
                  {t("noPatientFound")} {searchPhone}
                </div>
              )}
            </div>

            {/* Branding Card */}
            <LogiquelAdCard variant="landing" />
          </div>
        )}

        {/* STEP: Walk-in Registration Form */}
        {step === "form" && (
          <div className="animate-slide-up text-left">
            <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-7 shadow-xl shadow-blue-900/5 mb-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {t("walkinBadge")}
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {t("patientRegistration")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("home")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  {t("cancel")}
                </button>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl p-3 mb-4 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block font-body text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    {t("fullNameLabel")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("fullNamePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      {t("ageLabel")} *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      placeholder={t("agePlaceholder")}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      {t("genderLabel")} *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    >
                      <option value="Male">{t("male")}</option>
                      <option value="Female">{t("female")}</option>
                      <option value="Other">{t("other")}</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block font-body text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    {t("mobileNumberLabel")} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono-custom">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder={t("mobilePlaceholder")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom"
                    />
                  </div>
                </div>

                {/* City / Village */}
                <div>
                  <label className="block font-body text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    {t("cityVillageLabel")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("cityVillagePlaceholder")}
                    value={cityVillage}
                    onChange={(e) => setCityVillage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Reason / Problem */}
                <div>
                  <label className="block font-body text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    {t("reasonLabel")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("reasonPlaceholder")}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1D68F3] hover:bg-[#1554C6] active:scale-98 disabled:opacity-50 text-white font-display font-extrabold text-base rounded-2xl py-3.5 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-6"
                >
                  {loading ? (
                    <span>{t("submitting")}</span>
                  ) : (
                    <>
                      <Ticket size={18} />
                      <span>{t("getWalkinToken")}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STEP: Success / Ticket View */}
        {step === "success" && registeredPatient && (
          <div className="animate-slide-up text-center w-full">
            {/* Ticket Card Container */}
            <div
              ref={ticketRef}
              className="bg-gradient-to-br from-[#1E5BF6] via-[#2563EB] to-[#4F46E5] rounded-[28px] p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden text-center mb-6"
            >
              <div className="inline-flex items-center justify-center gap-2 text-white/90 text-xs sm:text-sm font-medium tracking-wide mb-2">
                <Ticket size={16} className="text-blue-200" />
                <span>{t("yourToken")}</span>
              </div>

              {/* Large Walkin Token Display */}
              <p className="font-mono-custom text-6xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight text-white drop-shadow-md my-2">
                {registeredPatient.walkin_token_display || registeredPatient.token_number}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-inner">
                <MapPin size={14} className="text-white" />
                <span>{t("walkinBadge")}</span>
              </div>

              <div className="w-12 h-1 bg-white/30 rounded-full mx-auto my-4" />

              {/* Patient Details Inside Ticket */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-left space-y-2 border border-white/15 text-xs sm:text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-blue-100">{t("patientName")}:</span>
                  <span className="font-bold text-white">{registeredPatient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">{t("ageGender")}:</span>
                  <span className="font-bold text-white">
                    {registeredPatient.age}y · {registeredPatient.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">{t("contactNumber")}:</span>
                  <span className="font-bold text-white font-mono-custom">{registeredPatient.phone}</span>
                </div>
                {registeredPatient.city_village && (
                  <div className="flex justify-between">
                    <span className="text-blue-100">{t("cityVillageLabel")}:</span>
                    <span className="font-bold text-white">{registeredPatient.city_village}</span>
                  </div>
                )}
                {registeredPatient.reason && (
                  <div className="flex justify-between">
                    <span className="text-blue-100">{t("reasonLabel")}:</span>
                    <span className="font-bold text-white">{registeredPatient.reason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment QR Code Card */}
            <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100 shadow-xl shadow-blue-900/5 mb-5 text-center overflow-hidden relative">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide mb-3">
                <QrCode size={14} className="text-blue-600 shrink-0" />
                <span>{t("scanToPayTitle")}</span>
              </div>

              <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                {t("scanToPayTitle")}
              </h3>
              <p className="font-body text-xs sm:text-sm text-slate-500 font-medium mb-4 max-w-xs mx-auto">
                {t("scanToPaySubtitle")}
              </p>

              {/* QR Code Container */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 sm:p-5 w-fit mx-auto mb-4 shadow-inner">
                <img
                  src="/payment-qr.png"
                  alt="Payment QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain mx-auto rounded-xl bg-white p-2 shadow-xs"
                />
              </div>

              {/* Screenshot Saving Guidance Notice */}
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 text-left flex items-start gap-2.5 max-w-md mx-auto">
                <Camera size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="font-body text-xs font-semibold text-amber-900 leading-relaxed">
                  {t("savePaymentScreenshotNotice")}
                </p>
              </div>
            </div>

            {/* Waiting Guidance Note */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left mb-5 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm font-extrabold text-emerald-900 mb-0.5">
                  {t("registrationSuccessful")}
                </p>
                <p className="font-body text-xs text-emerald-700 font-medium leading-relaxed">
                  {t("walkinWaitLobbyMsg")}
                </p>
              </div>
            </div>

            {/* Action Buttons: Download & WhatsApp */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleDownloadTicket}
                disabled={downloading}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>{downloading ? t("downloadingToken") : t("downloadTokenCard")}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] hover:bg-[#20BE5C] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 size={15} />
                <span>{t("shareOnWhatsApp")}</span>
              </button>
            </div>

            <button
              onClick={() => setStep("home")}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm py-3 rounded-xl transition-all cursor-pointer mb-6"
            >
              {t("backToHome")}
            </button>

            {/* Logiquel Branding */}
            <LogiquelAdCard variant="landing" />
          </div>
        )}
      </main>

      {/* Global Footer Note */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 font-medium">
        <div className="flex items-center justify-center gap-1.5">
          <Shield size={13} className="text-slate-400" />
          <span>{t("securityNotice")}</span>
        </div>
      </footer>
    </div>
  );
}
