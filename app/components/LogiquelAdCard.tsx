"use client";

import LogiquelLogo from "./LogiquelLogo";
import {
  Globe,
  Smartphone,
  Cpu,
  Code2,
  Rocket,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.932 9.932 0 001.336 4.993L2 22l5.233-1.37a9.923 9.923 0 004.779 1.218h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2zm5.666 14.161c-.237.666-1.38 1.274-1.898 1.341-.518.066-1.173.095-3.328-.795-2.756-1.139-4.526-3.928-4.664-4.112-.138-.184-1.121-1.492-1.121-2.846 0-1.354.708-2.019.96-2.285.253-.267.551-.334.735-.334.184 0 .368.003.528.01.173.008.406-.066.634.481.237.568.805 1.961.874 2.102.069.141.115.307.023.491-.092.184-.138.299-.276.463-.138.164-.29.345-.414.464-.138.138-.282.289-.121.564.161.275.713 1.177 1.53 1.905 1.05.936 1.937 1.226 2.213 1.364.276.138.437.115.597-.069.16-.184.689-.804.873-1.08.184-.276.368-.23.62-.138.253.092 1.608.758 1.884.896.276.138.46.207.528.322.069.115.069.666-.168 1.332z" />
    </svg>
  );
}

export function LaptopIllustration({ className = "w-28 h-28 sm:w-36 sm:h-36" }: { className?: string }) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      {/* Background Soft Blue Glow Circle */}
      <div className="absolute inset-0 bg-blue-50/90 rounded-full blur-2xs -z-0" />
      
      {/* Yellow Spark rays top right */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <div className="w-1.5 h-3 bg-amber-400 rounded-full transform rotate-45" />
        <div className="w-1.5 h-2 bg-amber-400 rounded-full transform -rotate-12 mt-1" />
      </div>

      {/* Laptop Illustration */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Laptop Screen */}
        <div className="w-22 sm:w-28 h-15 sm:h-18 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-xl p-1.5 shadow-md border border-blue-400/80 flex items-center justify-center relative">
          <div className="w-full h-full bg-blue-50/20 rounded-lg flex items-center justify-center border border-white/20 backdrop-blur-2xs">
            <span className="font-mono-custom text-white font-extrabold text-xs sm:text-base tracking-wider drop-shadow-xs">
              &lt;/&gt;
            </span>
          </div>
        </div>
        {/* Laptop Base Stand */}
        <div className="w-28 sm:w-36 h-2 bg-blue-400 rounded-b-md shadow-xs border-t border-blue-300" />
        {/* Base Notch */}
        <div className="w-8 h-1 bg-blue-500 rounded-b-sm mx-auto" />
      </div>
    </div>
  );
}

export default function LogiquelAdCard({ variant }: { variant: "token" | "landing" }) {
  const whatsappUrl =
    "https://wa.me/917048995281?text=hey%20i%20am%20intrested%20in%20avaling%20logiquel%20services";

  if (variant === "token") {
    return (
      <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden text-left mb-6">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <LogiquelLogo className="h-5 sm:h-6 w-auto" />
          </div>
          <span className="bg-slate-100/80 text-slate-500 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200/60">
            Built by Logiquel
          </span>
        </div>

        {/* Content & Illustration Flex */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-snug mb-2">
              We build digital solutions for modern businesses.
            </h3>
            <p className="font-body text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              From web & mobile apps to AI & automation, Logiquel helps companies build scalable, future-ready products.
            </p>
          </div>
          <LaptopIllustration className="hidden xs:flex w-24 h-24 sm:w-32 sm:h-32" />
        </div>

        {/* 4 Feature Pills Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <div className="bg-blue-50/80 border border-blue-100 text-slate-800 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Globe size={14} className="text-blue-600" />
            </div>
            <span className="truncate">Web Applications</span>
          </div>
          <div className="bg-purple-50/80 border border-purple-100 text-slate-800 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Smartphone size={14} className="text-purple-600" />
            </div>
            <span className="truncate">Mobile Apps</span>
          </div>
          <div className="bg-emerald-50/80 border border-emerald-100 text-slate-800 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Cpu size={14} className="text-emerald-600" />
            </div>
            <span className="truncate">AI & Automation</span>
          </div>
          <div className="bg-amber-50/80 border border-amber-100 text-slate-800 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Code2 size={14} className="text-amber-600" />
            </div>
            <span className="truncate">Custom Software</span>
          </div>
        </div>

        {/* Bottom Callout Box (Rocket Banner) */}
        <div className="bg-blue-50/60 border border-blue-100/90 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <Rocket size={18} />
            </div>
            <div>
              <p className="font-display font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">
                Let&apos;s Build Something Great
              </p>
              <p className="font-body text-[11px] sm:text-xs text-slate-500 font-medium">
                Your idea. Our technology.
              </p>
            </div>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <span>Get in Touch</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    );
  }

  // Landing variant
  return (
    <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden text-left mb-6">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <LogiquelLogo className="h-5 sm:h-6 w-auto" />
        </div>
        <span className="bg-slate-100/80 text-slate-500 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200/60">
          Built by Logiquel
        </span>
      </div>

      {/* Content & Illustration Flex */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-snug mb-2">
            Need a digital solution for your business?
          </h3>
          <p className="font-body text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-4">
            Web apps • Mobile apps • AI & Automation • Custom Software
          </p>
        </div>
        <LaptopIllustration className="hidden xs:flex w-24 h-24 sm:w-32 sm:h-32" />
      </div>

      {/* Buttons Row */}
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>Talk to Logiquel</span>
          <ArrowRight size={14} />
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-emerald-500/60 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-700 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>

      {/* Footer Note */}
      <div className="border-t border-slate-100 pt-3 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium">
        <CheckCircle2 size={13} className="text-slate-400 shrink-0" />
        <span>This patient portal is powered by Logiquel.</span>
      </div>
    </div>
  );
}
