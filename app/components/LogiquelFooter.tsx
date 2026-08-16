"use client";

import { Phone, ArrowUpRight } from "lucide-react";
import LogiquelLogo from "./LogiquelLogo";

export default function LogiquelFooter() {
  return (
    <footer className="w-full bg-white text-surface-700 relative overflow-hidden border-t border-surface-200/80 py-8 sm:py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-surface-200/70">
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="h-10 px-3 flex items-center justify-center rounded-xl bg-surface-50 border border-surface-200/80 shadow-2xs">
              <LogiquelLogo className="h-5 w-auto" />
            </div>
            <div className="border-l border-surface-200/80 pl-3.5 py-0.5">
              
              <p className="text-sm text-surface-500 font-body max-w-md leading-relaxed">
                Logiquel helps companies build scalable digital products—from websites and mobile applications to enterprise software and automation solutions.
              </p>
            </div>
          </div>

          {/* Contact Button */}
          <div>
            <a
              href="tel:7048995281"
              className="inline-flex items-center gap-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/80 px-4 py-2 rounded-xl font-body text-xs font-semibold transition-all shadow-xs"
            >
              <Phone size={14} className="text-brand-600" />
              <span>Contact Logiquel to bring your ideas to life <br/> (+91 7048995281)</span>
              <ArrowUpRight size={14} className="text-brand-500" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-body text-surface-500">
          <p className="font-medium text-surface-600">
            Empowering healthcare with smart queue management
          </p>
          <p>© {new Date().getFullYear()} LOGIQUEL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
