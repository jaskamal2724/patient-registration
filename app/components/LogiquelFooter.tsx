"use client";

import { MessageCircle, ArrowUpRight, Sparkles, Code2, Smartphone, Cpu, Rocket } from "lucide-react";
import LogiquelLogo from "./LogiquelLogo";

export default function LogiquelFooter() {
  return (
    <footer className="w-full relative pt-1 pb-8 px-4 sm:px-8">
      <div className="max-w-md md:max-w-lg mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/80 group">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl group-hover:bg-brand-500/30 transition-all duration-700 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl group-hover:bg-accent-500/30 transition-all duration-700 pointer-events-none" />

          {/* Top Badge */}
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold text-brand-300 tracking-wide uppercase shadow-inner">
              <Sparkles size={12} className="text-accent-400 animate-pulse" />
              Built & Engineered by Logiquel
            </span>
          </div>

          {/* Logo & Headline */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-white/95 backdrop-blur-md rounded-2xl mb-4 shadow-lg shadow-black/40">
              <LogiquelLogo className="h-6 w-auto" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              Need a Custom Web App or Software for Your Business?
            </h3>
          </div>

          
          {/* Capability Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 text-slate-300">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium">
              <Code2 size={12} className="text-brand-400" /> Web Applications
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium">
              <Smartphone size={12} className="text-accent-400" /> Mobile Apps
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium">
              <Cpu size={12} className="text-emerald-400" /> AI & Automation
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium">
              <Rocket size={12} className="text-amber-400" /> Custom Software
            </span>
          </div>

          {/* Call to Action Button */}
          <div className="flex justify-center mb-6">
            <a
              href="https://wa.me/917048995281?text=hey%20i%20am%20intrested%20in%20avaling%20logiquel%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-brand-600 hover:from-emerald-600 hover:to-brand-700 text-white font-body text-xs sm:text-sm font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/20 group/btn"
            >
              <MessageCircle size={18} className="text-white fill-white/20 animate-pulse" />
              <div className="flex flex-col text-left">
                <span>Let&apos;s Build Together</span>
                <span className="text-sm opacity-90 font-normal">+91 7048995281</span>
              </div>
              <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-slate-800/90 pt-4 text-center">
            <p className="text-sm text-white font-body">
              © {new Date().getFullYear()} LOGIQUEL. All rights reserved. • Empowering Modern Businesses
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
