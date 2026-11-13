"use client";

import { Suspense } from "react";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { PatientHeader } from "@/app/components/PatientPortal";
import LogiquelAdCard from "@/app/components/LogiquelAdCard";

function ShopContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between">
      {/* Top Header */}
      <PatientHeader subtitle={t("navShop")} />

      {/* Main Content */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-28 sm:pb-32 flex-1">
        {/* Coming Soon Card */}
        <div className="bg-gradient-to-br from-[#1D68F3] via-[#1452C7] to-[#0A2E7A] rounded-[24px] sm:rounded-[28px] p-8 sm:p-12 text-white shadow-xl shadow-blue-900/15 mb-6 relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px]">
          {/* Ambient Glowing Orbs */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />

          {/* Sweeping Diagonal Light Beam */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
            <div className="w-28 sm:w-36 h-[300%] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md animate-diagonal-beam pointer-events-none" />
          </div>

          {/* Liquid Flowing Waves at Bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none overflow-hidden z-0 opacity-20">
            <svg
              className="absolute bottom-0 w-[200%] h-14 animate-liquid-wave"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              fill="white"
            >
              <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z" />
            </svg>
            <svg
              className="absolute bottom-0 w-[200%] h-14 animate-liquid-wave-fast opacity-60"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              fill="#93C5FD"
            >
              <path d="M0,40 C300,10 450,100 600,30 C750,-40 950,80 1200,20 L1200,120 L0,120 Z" />
            </svg>
          </div>

          {/* Foreground Animated Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Store Icon with Levitation and Pulsing Halo */}
            <div className="relative mb-5">
              {/* Pulsing Aura Halo */}
              <div className="absolute -inset-3 rounded-full bg-cyan-400/25 blur-lg animate-pulse-glow pointer-events-none" />

              {/* Floating Glass Icon Box */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/15 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-2xl animate-float-gentle text-white">
                <ShoppingBag size={42} className="text-amber-300 drop-shadow-md" />
              </div>
            </div>

            {/* Shimmering Golden Coming Soon Badge */}
            <div className="relative inline-flex items-center gap-2 bg-[linear-gradient(110deg,#F59E0B,45%,#FEF08A,55%,#F59E0B)] bg-[length:200%_100%] animate-shimmer text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider px-5 py-2 rounded-full shadow-lg shadow-amber-500/25 border border-amber-300/60 select-none">
              <Sparkles size={16} className="text-slate-950 animate-pulse" />
              <span>{t("comingSoon")}</span>
            </div>
          </div>
        </div>

        {/* Branding Footer Card */}
        <LogiquelAdCard variant="landing" />
      </main>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}
