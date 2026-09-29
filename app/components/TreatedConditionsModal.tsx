"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { TREATED_CONDITIONS, ConditionItem } from "./treatedConditionsData";
import {
  X,
  Activity,
  Heart,
  Baby,
  Stethoscope,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface TreatedConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterCategory = "all" | "general" | "women" | "children";

export default function TreatedConditionsModal({
  isOpen,
  onClose,
}: TreatedConditionsModalProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<FilterCategory>("all");

  const filteredConditions = useMemo(() => {
    return TREATED_CONDITIONS.filter((item) => {
      return activeTab === "all" || item.category === activeTab;
    });
  }, [activeTab]);

  if (!isOpen) return null;

  const generalCount = TREATED_CONDITIONS.filter(
    (c) => c.category === "general"
  ).length;
  const womenCount = TREATED_CONDITIONS.filter(
    (c) => c.category === "women"
  ).length;
  const childrenCount = TREATED_CONDITIONS.filter(
    (c) => c.category === "children"
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-slide-up relative overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-4 sm:p-6 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
            aria-label={t("closeModal")}
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles size={13} className="text-amber-300" />
              <span>
                {language === "hi"
                  ? "विशेष परामर्श व उपचार"
                  : "Specialities & Treatments"}
              </span>
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            {t("treatedConditionsModalTitle")}
          </h3>
          <p className="font-body text-xs sm:text-sm text-blue-100 mt-1 font-medium leading-relaxed max-w-xl">
            {t("treatedConditionsModalSubtitle")}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-[#1D68F3] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80"
            }`}
          >
            <Activity size={13} />
            <span>{t("tabAll")}</span>
          </button>

          <button
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "general"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80"
            }`}
          >
            <Stethoscope size={13} />
            <span>{t("tabGeneral")}</span>
          </button>

          <button
            onClick={() => setActiveTab("women")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "women"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80"
            }`}
          >
            <Heart size={13} />
            <span>{t("tabWomen")}</span>
          </button>

          <button
            onClick={() => setActiveTab("children")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "children"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80"
            }`}
          >
            <Baby size={13} />
            <span>{t("tabChildren")}</span>
          </button>
        </div>

        {/* List Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredConditions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Stethoscope size={36} className="mx-auto mb-2 opacity-40" />
              <p className="font-body text-sm font-semibold">
                {t("noConditionsFound")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredConditions.map((item) => {
                const primaryText = language === "hi" ? item.hi : item.en;
                const secondaryText = language === "hi" ? item.en : item.hi;
                const isWomen = item.category === "women";
                const isChildren = item.category === "children";

                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl border transition-all hover:shadow-xs ${
                      isWomen
                        ? "bg-rose-50/60 border-rose-200/70 text-rose-950"
                        : isChildren
                        ? "bg-purple-50/60 border-purple-200/70 text-purple-950"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-900"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                        isWomen
                          ? "bg-rose-100 text-rose-700"
                          : isChildren
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <CheckCircle2 size={13} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs sm:text-sm font-bold leading-snug text-slate-900">
                        {primaryText}
                      </p>
                      <p
                        className={`text-[11px] sm:text-xs mt-1 font-medium leading-relaxed ${
                          isWomen
                            ? "text-rose-800/90"
                            : isChildren
                            ? "text-purple-800/90"
                            : "text-slate-600"
                        }`}
                      >
                        {secondaryText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium font-body">
            {language === "hi"
              ? `कुल ${filteredConditions.length} समस्याएं प्रदर्शित`
              : `Showing ${filteredConditions.length} condition(s)`}
          </p>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-body font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            {t("closeModal")}
          </button>
        </div>
      </div>
    </div>
  );
}
