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
  const [pwd, setPwd] = useState(false);
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
          const list = await api.fetchWalkinPatients();
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
                  const updated = await api.fetchWalkinPatients().catch(() => []);
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
        pwd,
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
      setPwd(false);
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
                  
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B1527] tracking-tight leading-snug mb-4 whitespace-pre-line">
                    {t("walkinTitle")}
                  </h2>

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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={3}
                      required
                      placeholder={t("agePlaceholder")}
                      value={age}
                      onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
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
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      required
                      placeholder={t("mobilePlaceholder")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom"
                    />
                  </div>
                </div>

                {/* Person with Disability (PwD) Question */}
                <div>
                  <label className="block font-body text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    {t("areYouDisabled")} *
                  </label>
                  <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3 sm:p-3.5">
                    <p className="font-body text-[11px] text-slate-500 font-medium mb-2.5">
                      {t("areYouDisabledDesc")}
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPwd(false)}
                        className={`py-2.5 px-4 rounded-xl font-body text-xs sm:text-sm font-extrabold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                          !pwd
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>{t("no")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPwd(true)}
                        className={`py-2.5 px-4 rounded-xl font-body text-xs sm:text-sm font-extrabold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                          pwd
                            ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/25"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        <span>{t("yes")}</span>
                        {pwd && (
                          <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-md font-mono-custom">
                            PwD
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
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
                {registeredPatient.pwd && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/15">
                    <span className="text-amber-200 font-bold">{t("pwdBadge")}:</span>
                    <span className="bg-amber-400 text-slate-900 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {t("yes")} (Priority)
                    </span>
                  </div>
                )}
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

      
    </div>
  );
}
