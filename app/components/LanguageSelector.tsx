"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSelector({
  variant = "pill",
  className = "",
}: {
  variant?: "pill" | "segmented";
  className?: string;
}) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200/90 text-xs font-bold font-body ${className}`}
      >
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            language === "en"
              ? "bg-white text-blue-600 shadow-xs font-extrabold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage("hi")}
          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            language === "hi"
              ? "bg-white text-blue-600 shadow-xs font-extrabold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          हिंदी
        </button>
      </div>
    );
  }

  // Default Pill Switcher
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-full px-3 py-1.5 shadow-xs transition-all cursor-pointer shrink-0 w-fit ${className}`}
      title={language === "en" ? "Switch to Hindi" : "अंग्रेजी में बदलें"}
    >
      <Globe size={13} className="text-blue-600 shrink-0" />
      <span className="font-extrabold text-blue-600">
        {language === "en" ? "English" : "हिंदी"}
      </span>
    </button>
  );
}
