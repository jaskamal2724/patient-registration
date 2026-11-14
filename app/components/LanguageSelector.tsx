"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { Globe, ChevronDown, Check } from "lucide-react";

export default function LanguageSelector({
  className = "",
  showLabel = false,
}: {
  variant?: "pill" | "segmented";
  className?: string;
  showLabel?: boolean;
}) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedLabel = language === "hi" ? "हिंदी" : "English";

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left shrink-0 ${
        isOpen ? "z-50" : "z-20"
      } ${className}`}
    >
      {/* Language Trigger Button (showing only the selected language with chevron) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Selected language: ${selectedLabel}. Click to switch language`}
        className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200/90 rounded-full px-2.5 sm:px-3 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 shadow-2xs transition-all cursor-pointer select-none"
      >
        <Globe size={13} className="text-blue-600 shrink-0" />
        {showLabel && (
          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline mr-0.5">
            Language:
          </span>
        )}
        <span className="font-extrabold text-slate-800">{selectedLabel}</span>
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu to switch languages */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/90 p-1.5 z-50 animate-fade-in origin-top-right">
          <button
            type="button"
            onClick={() => {
              setLanguage("en");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer select-none ${
              language === "en"
                ? "bg-blue-50 text-blue-700 font-extrabold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>English</span>
            {language === "en" && <Check size={13} className="text-blue-600 shrink-0" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setLanguage("hi");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer select-none ${
              language === "hi"
                ? "bg-blue-50 text-blue-700 font-extrabold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>हिंदी</span>
            {language === "hi" && <Check size={13} className="text-blue-600 shrink-0" />}
          </button>
        </div>
      )}
    </div>
  );
}
