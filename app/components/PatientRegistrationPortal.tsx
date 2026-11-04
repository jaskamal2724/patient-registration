"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Radio,
  AlertCircle,
  Shield,
} from "lucide-react";
import { usePatientView } from "@/lib/usePatientView";
import type { Patient } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import Toast from "./Toast";
import DoctorDelayBanner from "./DoctorDelayBanner";
import LoadingScreen from "./LoadingScreen";
import LogiquelAdCard from "./LogiquelAdCard";
import {
  getTimeSlots,
  normalizeSlotLabel,
} from "../util/timeSlot";
import {
  PatientHeader,
  RegistrationForm,
  AppointmentsFullView,
  SuccessScreen,
} from "./PatientPortal";
import RegistrationSuccessAnimation from "./RegistrationSuccessAnimation";

interface TimeSlot {
  label: string;
}

export default function PatientRegistrationPortal() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const { t, tTime12Hour, tDynamic } = useLanguage();
  const {
    regWindow,
    patients,
    walkinPatients,
    addPatient,
    toast,
    initialLoading,
    initialLoadError,
    retryInitialLoad,
  } = usePatientView();

  const [step, setStep] = useState<"form" | "full" | "success">("form");
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [TIME_SLOTS, setTIME_SLOTS] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Fetch slot availability to check if all slots are full
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch("/api/time-slot", { cache: "no-store" });
        const json = await res.json();
        if (json?.data?.[0]) {
          const slots = getTimeSlots(
            json.data[0].start_time,
            json.data[0].end_time,
            "15:00",
            "16:00",
            60,
            0,
          );
          setTIME_SLOTS(slots.map((s: TimeSlot) => s.label));
        }
      } catch {
        const slots = getTimeSlots(
          regWindow.startTime || "10:00",
          regWindow.endTime || "19:00",
          "15:00",
          "16:00",
          60,
          0,
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
  const inProgressWalkin = (walkinPatients || []).find(
    (p) => p.status === "in-progress" || (p.status as string) === "in_progress",
  );

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      ref={pageRef}
      className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between"
    >
      {/* Top Header */}
      <PatientHeader
        subtitle={t("patientRegistration")}
        onExit={() => {
          if (step === "full") {
            setStep("form");
          } else {
            router.push("/");
          }
        }}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-28 sm:pb-32 flex-1">
        {/* Doctor Delay Alert Banner across all registration steps */}
        {!initialLoading && regWindow.delayMinutes > 0 && (
          <div className="mb-4">
            <DoctorDelayBanner
              delayMinutes={regWindow.delayMinutes}
              variant={step === "form" ? "banner" : "card"}
            />
          </div>
        )}

        {/* Initial Load Error */}
        {initialLoadError ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center border border-red-100 shadow-xl shadow-red-900/5 my-6 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
              Unable to load OPD registration
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-body">
              Please check your connection and try again.
            </p>
            <button
              onClick={retryInitialLoad}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-md shadow-blue-500/20"
            >
              Retry
            </button>
          </div>
        ) : !regWindow.isOpen ? (
          /* When Registration is CLOSED by Doctor */
          <div className="animate-slide-up text-left space-y-4">
            <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-5 sm:p-7 shadow-xl shadow-blue-900/5 text-left relative overflow-hidden">
              <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide mb-3 shadow-2xs">
                <AlertCircle size={12} className="text-amber-600 shrink-0" />
                <span>{t("closed")}</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B1527] tracking-tight leading-snug mb-2">
                {t("opdClosedTitle")}
              </h2>
              <p className="font-body text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-4">
                {t("opdClosedSubtitle")}
              </p>

              {/* Timing Information */}
              <div className="bg-[#F0F5FF] border border-blue-100/90 rounded-2xl p-3.5 mb-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Clock size={15} className="text-[#1D68F3] shrink-0" />
                  <span>
                    {t("expectedTimeLabel")}: {tTime12Hour(regWindow.startTime)} – {tTime12Hour(regWindow.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Calendar size={15} className="text-[#1D68F3] shrink-0" />
                  <span>{tDynamic(regWindow.message)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => router.push("/patient")}
                  className="bg-[#1D68F3] hover:bg-[#1554C6] text-white font-bold text-xs sm:text-sm py-3 px-3 rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Radio size={15} className="shrink-0" />
                  <span>{t("liveQueue")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm py-3 px-3 rounded-2xl transition-all cursor-pointer active:scale-95"
                >
                  {t("backToHome")}
                </button>
              </div>
            </div>

            <LogiquelAdCard variant="landing" />
          </div>
        ) : step === "full" || (allSlotsFull && step === "form") ? (
          /* Slots Full View */
          <div className="animate-slide-up space-y-4">
            <AppointmentsFullView
              patients={patients}
              onBack={() => router.push("/")}
              onSelectPatient={(p) => {
                setRegisteredPatient(p);
                setStep("success");
              }}
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/patient")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
              >
                <Radio size={14} />
                <span>{t("liveQueue")}</span>
              </button>
            </div>
          </div>
        ) : step === "form" ? (
          /* Registration Form View */
          <div className="space-y-4">
            <RegistrationForm
              onSuccess={(p) => {
                setRegisteredPatient(p);
                setShowCelebration(true);
                setStep("success");
              }}
              regWindow={regWindow}
              addPatient={addPatient}
              patients={patients}
              onCancel={() => router.push("/")}
            />

            {/* Check Live Queue Prompt Card */}
            <div className="bg-white rounded-[22px] border border-slate-100/90 p-4 shadow-sm flex items-center justify-between gap-3 text-left">
              <div className="min-w-0">
                <p className="font-display text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                  {t("alreadyRegisteredPrompt")}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {t("checkLiveQueueOrToken")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/patient")}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl shrink-0 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
              >
                <Radio size={13} className="text-emerald-400" />
                <span>{t("liveQueue")}</span>
              </button>
            </div>

            {/* Branding Banner */}
            <LogiquelAdCard variant="landing" />

            {/* Security Notice Footer */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium pt-2">
              <Shield size={14} className="text-slate-400" />
              <span>{t("privacyNotice")}</span>
            </div>
          </div>
        ) : step === "success" && registeredPatient ? (
          /* Success Screen View */
          <div className="space-y-4">
            <SuccessScreen
              patient={registeredPatient}
              patients={patients}
              walkinPatients={walkinPatients}
              doctorIsSeeingPatient={Boolean(inProgress || inProgressWalkin)}
              pageRef={pageRef}
              delayMinutes={regWindow.delayMinutes}
              onBookAnother={() => {
                setRegisteredPatient(null);
                setStep("form");
              }}
              onBackToHome={() => router.push("/")}
              onViewQueue={() => router.push("/patient")}
            />
          </div>
        ) : null}
      </main>

      {/* Celebration Animation (Party Bursters + Green Tick) */}
      <RegistrationSuccessAnimation
        isOpen={showCelebration}
        onComplete={() => setShowCelebration(false)}
        tokenNumber={registeredPatient?.slot_token_number || registeredPatient?.token_number}
      />

      <Toast toast={toast} />
    </div>
  );
}
