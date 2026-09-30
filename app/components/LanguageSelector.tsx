"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSelector({
  className = "",
  showLabel = false,
}: {
  variant?: "pill" | "segmented";
  className?: string;
  showLabel?: boolean;
}) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Select Language / भाषा चुनें"
      className={`inline-flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/90 shadow-2xs font-body shrink-0 ${className}`}
    >
      <div className="flex items-center gap-1 pl-1.5 pr-1 text-slate-500 select-none">
        <Globe size={14} className="text-blue-600 shrink-0" />
        {showLabel && (
          <span className="text-[11px] font-bold text-slate-600 hidden sm:inline mr-0.5">
            Language:
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`px-2.5 py-1 text-xs rounded-full transition-all cursor-pointer select-none font-bold ${
          language === "en"
            ? "bg-white text-blue-600 shadow-xs font-extrabold"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="Switch to English"
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        aria-pressed={language === "hi"}
        className={`px-2.5 py-1 text-xs rounded-full transition-all cursor-pointer select-none font-bold ${
          language === "hi"
            ? "bg-white text-blue-600 shadow-xs font-extrabold"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="हिंदी में बदलें"
      >
        हिंदी
      </button>
    </div>
  );
}

