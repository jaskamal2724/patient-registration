"use client";

import React from "react";
import { Clock, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface DoctorDelayBannerProps {
  delayMinutes: number;
  variant?: "banner" | "card" | "ticket";
  className?: string;
  doctorName?: string;
}

export default function DoctorDelayBanner({
  delayMinutes,
  variant = "card",
  className = "",
  doctorName,
}: DoctorDelayBannerProps) {
  const { t, tDelay, language } = useLanguage();

  if (!delayMinutes || delayMinutes <= 0) return null;

  const delayStr = tDelay(delayMinutes);

  if (variant === "ticket") {
    return (
      <div
        className={`bg-gradient-to-r from-amber-500/15 via-amber-500/20 to-orange-500/15 border-2 border-amber-400/80 rounded-2xl p-4 text-left shadow-sm relative overflow-hidden ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 shadow-xs mt-0.5 animate-pulse">
            <Clock size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-display text-sm font-black text-amber-950">
                {t("doctorLateTitle")}
              </span>
              <span className="inline-flex items-center text-[11px] font-extrabold bg-amber-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                +{delayStr}
              </span>
            </div>
            <p className="font-body text-xs font-semibold text-amber-900 leading-relaxed">
              {language === "hi"
                ? `आपका अपॉइंटमेंट स्लॉट सुरक्षित है। डॉक्टर लगभग ${delayStr} की देरी से हैं, इसलिए अपनी बारी के अनुसार क्लिनिक पहुँचें।`
                : `Your appointment slot is confirmed. Doctor is running ~${delayStr} behind schedule today. Please plan your clinic arrival accordingly.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-300/90 rounded-2xl p-3 sm:p-3.5 text-left flex items-center justify-between gap-3 text-amber-950 shadow-xs ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0">
            <AlertTriangle size={15} />
          </div>
          <p className="font-body text-xs font-bold text-amber-950 truncate">
            <span>{t("doctorLateTitle")}: </span>
            <span className="text-amber-800 font-extrabold">+{delayStr} {language === "hi" ? "विलंब" : "delay"}</span>
            <span className="hidden sm:inline text-amber-700 font-normal">
              {" "}— {language === "hi" ? "स्लॉट समय अपरिवर्तित रहेगा" : "Slots remain unchanged"}
            </span>
          </p>
        </div>
        <span className="shrink-0 text-[10px] sm:text-xs font-extrabold bg-amber-200/90 text-amber-900 border border-amber-300 rounded-full px-2.5 py-0.5">
          +{delayStr}
        </span>
      </div>
    );
  }

  // Default: "card"
  return (
    <div
      className={`bg-gradient-to-br from-amber-50 via-amber-50/70 to-orange-50 border-2 border-amber-300/80 rounded-[22px] p-4 sm:p-5 text-left shadow-sm relative overflow-hidden ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0 shadow-md shadow-amber-500/25 mt-0.5">
          <Clock size={20} className="animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-display text-sm sm:text-base font-black text-amber-950">
              {t("doctorLateTitle")}
            </span>
            <span className="inline-flex items-center text-xs font-black bg-amber-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
              +{delayStr}
            </span>
          </div>
          <p className="font-body text-xs sm:text-[13px] font-medium text-amber-900 mt-1 leading-relaxed">
            {t("doctorLateDesc", { delay: delayStr })}
          </p>
          <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center gap-2 text-[11px] font-bold text-amber-800">
            <ShieldCheck size={13} className="text-amber-600 shrink-0" />
            <span>
              {language === "hi"
                ? "अपॉइंटमेंट स्लॉट का समय वही रहेगा, केवल परामर्श में विलंब होगा।"
                : "Appointment slot timings remain fixed; only consultation order is running late."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
