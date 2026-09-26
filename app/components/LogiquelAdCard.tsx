"use client";

import LogiquelLogo from "./LogiquelLogo";
import {
  Globe,
  Smartphone,
  Cpu,
  Code2,
  Rocket,
  ArrowRight,
} from "lucide-react";

export function LaptopIllustration({
  className = "w-32 h-32 sm:w-40 sm:h-40",
}: {
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      {/* Background Soft Blue Glow Circle */}
      <div className="absolute inset-0 bg-blue-50/80 rounded-full blur-2xs -z-0" />

      {/* Floating Accent Blue Circle */}
      <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-70" />

      {/* Yellow Spark rays top right */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <div className="w-1.5 h-3 bg-amber-400 rounded-full transform rotate-45" />
        <div className="w-1.5 h-2 bg-amber-400 rounded-full transform -rotate-12 mt-1" />
        <div className="w-2 h-1 bg-blue-400 rounded-full transform rotate-12 mt-3" />
      </div>

      {/* Laptop Illustration */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Laptop Screen */}
        <div className="w-26 sm:w-32 h-17 sm:h-20 bg-blue-600 rounded-t-xl p-1.5 shadow-md border border-blue-500 flex items-center justify-center relative">
          <div className="w-full h-full bg-[#EBF3FF] rounded-lg flex items-center justify-center shadow-inner">
            <span className="font-mono-custom text-blue-600 font-black text-sm sm:text-lg tracking-wider">
              &lt;/&gt;
            </span>
          </div>
        </div>
        {/* Laptop Base Stand */}
        <div className="w-32 sm:w-40 h-2.5 bg-blue-600 rounded-b-md shadow-xs border-t border-blue-400" />
        {/* Base Notch */}
        <div className="w-10 h-1 bg-blue-700 rounded-b-xs mx-auto" />
      </div>
    </div>
  );
}

export default function LogiquelAdCard({
  variant = "token",
}: {
  variant?: "token" | "landing";
}) {
  const whatsappUrl =
    "https://wa.me/917048995281?text=hey%20i%20am%20intrested%20in%20avaling%20logiquel%20services";

  return (
    <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-7 border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden text-left mb-6">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <LogiquelLogo className="h-5 sm:h-6 w-auto" />
        </div>
        <span className="bg-[#F1F5F9] text-slate-500 text-[11px] sm:text-xs font-medium px-3 py-0.5 rounded-full border border-slate-200/60">
          Built by Logiquel
        </span>
      </div>

      {/* Content & Illustration Flex */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl sm:text-2xl tracking-tight leading-snug mb-2">
            We build digital solutions for modern businesses.
          </h3>
          <p className="font-body text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md">
            From web &amp; mobile apps to AI &amp; automation, Logiquel helps companies build scalable, future-ready products.
          </p>
        </div>
        <LaptopIllustration className="hidden xs:flex w-28 h-28 sm:w-36 sm:h-36" />
      </div>

      {/* 4 Feature Pills Row - 2-line stacked label structure to prevent overflow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-5">
        <div className="bg-[#EFF6FF] border border-blue-100 text-slate-800 p-2 sm:p-2.5 rounded-2xl flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Globe size={15} />
          </div>
          <div className="flex flex-col text-[11px] sm:text-xs font-bold leading-tight min-w-0">
            <span className="truncate">Web</span>
            <span className="truncate">Applications</span>
          </div>
        </div>

        <div className="bg-[#FAF5FF] border border-purple-100 text-slate-800 p-2 sm:p-2.5 rounded-2xl flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone size={15} />
          </div>
          <div className="flex flex-col text-[11px] sm:text-xs font-bold leading-tight min-w-0">
            <span className="truncate">Mobile</span>
            <span className="truncate">Apps</span>
          </div>
        </div>

        <div className="bg-[#F0FDF4] border border-emerald-100 text-slate-800 p-2 sm:p-2.5 rounded-2xl flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Cpu size={15} />
          </div>
          <div className="flex flex-col text-[11px] sm:text-xs font-bold leading-tight min-w-0">
            <span className="truncate">AI &amp;</span>
            <span className="truncate">Automation</span>
          </div>
        </div>

        <div className="bg-[#FFFBEB] border border-amber-100 text-slate-800 p-2 sm:p-2.5 rounded-2xl flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Code2 size={15} />
          </div>
          <div className="flex flex-col text-[11px] sm:text-xs font-bold leading-tight min-w-0">
            <span className="truncate">Custom</span>
            <span className="truncate">Software</span>
          </div>
        </div>
      </div>

      {/* Bottom Callout Box (Rocket Banner) */}
      <div className="bg-[#ECF4FF] border border-blue-100/90 rounded-2xl p-4 sm:p-4.5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-blue-600 flex items-center justify-center shrink-0">
            <Rocket size={22} className="fill-blue-600/20" />
          </div>
          <div>
            <p className="font-display font-extrabold text-[#1E3A8A] text-sm sm:text-base leading-tight">
              Let&apos;s Build Something Great
            </p>
            <p className="font-body text-xs text-slate-500 font-medium mt-0.5">
              Your idea. Our technology.
            </p>
          </div>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
        >
          <span>Get in Touch</span>
          <ArrowRight size={15} />
        </a>
      </div>
    </div>
  );
}
