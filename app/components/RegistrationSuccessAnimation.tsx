"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface RegistrationSuccessAnimationProps {
  isOpen: boolean;
  onComplete: () => void;
  tokenNumber?: string | number;
  durationMs?: number;
}

export default function RegistrationSuccessAnimation({
  isOpen,
  onComplete,
  durationMs = 2400,
}: RegistrationSuccessAnimationProps) {
  const { t } = useLanguage();
  const completedRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const handleFinish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsClosing(true);

    setTimeout(() => {
      onComplete();
    }, 280);
  }, [onComplete]);

  useEffect(() => {
    if (!isOpen) {
      completedRef.current = false;
      setIsClosing(false);
      setProgressWidth(0);
      return;
    }

    // Reset state on open and force SVG animation to replay
    completedRef.current = false;
    setIsClosing(false);
    setProgressWidth(0);
    setAnimKey((prev) => prev + 1);

    // Trigger smooth progress bar fill
    const progressTimer = setTimeout(() => {
      setProgressWidth(100);
    }, 40);

    // Auto-transition to token screen after animation completes (SVG SMIL duration is 2s)
    const timer = setTimeout(() => {
      handleFinish();
    }, durationMs);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(timer);
    };
  }, [isOpen, durationMs, handleFinish]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Registration Success"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md transition-all duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={(e) => {
        // Clicking backdrop skips directly to token screen
        if (e.target === e.currentTarget) {
          handleFinish();
        }
      }}
    >
      <div
        className={`bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full mx-auto shadow-2xl shadow-blue-900/30 border border-slate-100 relative overflow-hidden flex flex-col items-center text-center transition-all duration-300 transform ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Soft background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Animated SVG Display Area */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={animKey}
            src={`/animations/result-page-success.svg?t=${animKey}`}
            alt="Success Animation"
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Messaging */}
        <div className="space-y-1.5 mt-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs">
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            <span>{t("registrationSuccessful")}</span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {t("appointmentConfirmedTitle") || "Booking Confirmed!"}
          </h3>

          <p className="font-body text-xs sm:text-sm text-slate-500 font-medium">
            {t("generatingTokenSubtitle") || "Generating your OPD token..."}
          </p>
        </div>

        {/* Animated Progress indicator & quick action */}
        <div className="mt-5 w-full flex flex-col items-center gap-2 relative z-10">
          <div className="w-28 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-full transition-all ease-out"
              style={{
                width: `${progressWidth}%`,
                transitionDuration: `${durationMs - 100}ms`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors pt-1.5 cursor-pointer flex items-center gap-1"
          >
            <span>{t("viewTokenNow") || "View Token"}</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
