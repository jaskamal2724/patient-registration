"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Heart,
  Baby,
  Activity,
  Search,
  X,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { TREATED_CONDITIONS } from "@/app/components/treatedConditionsData";
import { PatientHeader } from "@/app/components/PatientPortal";
import LogiquelAdCard from "@/app/components/LogiquelAdCard";

type FilterCategory = "all" | "general" | "women" | "children";

function WhatWeTreatContent() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const generalCount = TREATED_CONDITIONS.filter((c) => c.category === "general").length;
  const womenCount = TREATED_CONDITIONS.filter((c) => c.category === "women").length;
  const childrenCount = TREATED_CONDITIONS.filter((c) => c.category === "children").length;

  const filteredConditions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TREATED_CONDITIONS.filter((item) => {
      const matchesCategory = activeTab === "all" || item.category === activeTab;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        item.en.toLowerCase().includes(q) ||
        item.hi.toLowerCase().includes(q)
      );
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between">
      {/* Header */}
      <PatientHeader subtitle={t("navWhatWeTreat")} />

      {/* Main Content */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-28 sm:pb-32 flex-1">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#1D68F3] via-[#1554C6] to-[#0D388E] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 text-white shadow-xl shadow-blue-900/10 mb-4 relative overflow-hidden text-left">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles size={13} className="text-amber-300" />
              <span>{t("totalConditionsCount")}</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
              <ShieldCheck size={12} />
              <span>{t("doctorName")}</span>
            </span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-2">
            {t("treatedConditionsModalTitle")}
          </h1>
          <p className="font-body text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
            {t("treatedConditionsModalSubtitle")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex items-center gap-2 relative mb-4">
          <Search size={18} className="text-slate-400 ml-3 shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent font-body text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none pr-8 py-2"
            placeholder={t("searchConditionsPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "all"
                ? "bg-[#1D68F3] text-white shadow-sm shadow-blue-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Sparkles size={13} className={activeTab === "all" ? "text-amber-300" : "text-slate-400"} />
            <span>{language === "hi" ? `सभी (${TREATED_CONDITIONS.length})` : `All (${TREATED_CONDITIONS.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "general"
                ? "bg-[#1D68F3] text-white shadow-sm shadow-blue-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Activity size={13} className={activeTab === "general" ? "text-white" : "text-blue-500"} />
            <span>{language === "hi" ? `मुख्य (${generalCount})` : `General (${generalCount})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("women")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "women"
                ? "bg-rose-600 text-white shadow-sm shadow-rose-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Heart size={13} className={activeTab === "women" ? "text-white" : "text-rose-500"} />
            <span>{language === "hi" ? `महिलाएं (${womenCount})` : `Women (${womenCount})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("children")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "children"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Baby size={13} className={activeTab === "children" ? "text-white" : "text-amber-500"} />
            <span>{language === "hi" ? `बच्चे (${childrenCount})` : `Children (${childrenCount})`}</span>
          </button>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1 mb-3">
          <span>{filteredConditions.length} {language === "hi" ? "समस्याएं सूचीबद्ध" : "conditions listed"}</span>
          <button
            type="button"
            onClick={() => router.push("/patient-registration")}
            className="text-[#1D68F3] hover:underline flex items-center gap-1 font-bold"
          >
            <Calendar size={13} />
            <span>{t("navBookNow")}</span>
          </button>
        </div>

        {/* Conditions List */}
        {filteredConditions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
            <Stethoscope size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-display font-bold text-slate-700 text-sm mb-1">
              {t("noConditionsFound")}
            </p>
            <p className="text-xs text-slate-400">
              {language === "hi"
                ? "कृपया अन्य कीवर्ड खोजें या डॉक्टर से परामर्श करें।"
                : "Try searching with a different symptom keyword or consult the doctor."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 mb-6">
            {filteredConditions.map((item, idx) => {
              const primaryTitle = language === "hi" ? item.hi : item.en;
              const secondaryTitle = language === "hi" ? item.en : item.hi;

              const badgeColor =
                item.category === "women"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : item.category === "children"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200";

              const badgeLabel =
                item.category === "women"
                  ? language === "hi" ? "महिलाएं" : "Women"
                  : item.category === "children"
                  ? language === "hi" ? "बच्चे" : "Children"
                  : language === "hi" ? "सामान्य" : "General";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-left flex items-start gap-3 justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                    </div>

                    <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-[#1D68F3] transition-colors">
                      {primaryTitle}
                    </h2>

                    <p className="font-body text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                      {secondaryTitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/patient-registration")}
                    className="shrink-0 bg-blue-50 hover:bg-[#1D68F3] text-[#1D68F3] hover:text-white p-2 rounded-xl transition-all cursor-pointer self-center"
                    title={t("bookSlotBtn")}
                    aria-label={`Book appointment for ${primaryTitle}`}
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick CTA to Book */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-md shadow-blue-500/5 mb-6 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1D68F3] flex items-center justify-center mx-auto mb-2.5">
            <Calendar size={20} />
          </div>
          <h3 className="font-display text-base font-extrabold text-slate-900 mb-1">
            {t("bookVisitCTA")}
          </h3>
          <p className="font-body text-xs text-slate-500 mb-3.5 max-w-sm mx-auto">
            {t("bookVisitCTASub")}
          </p>
          <button
            type="button"
            onClick={() => router.push("/patient-registration")}
            className="w-full bg-[#1D68F3] hover:bg-[#1554C6] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Calendar size={15} />
            <span>{t("bookSlotBtn")}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Branding Footer Card */}
        <LogiquelAdCard variant="landing" />
      </main>
    </div>
  );
}

export default function WhatWeTreatPage() {
  return (
    <Suspense fallback={null}>
      <WhatWeTreatContent />
    </Suspense>
  );
}
