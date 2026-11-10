"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, Stethoscope, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface NavItem {
  key: string;
  labelKey: "navHome" | "navBookNow" | "navWhatWeTreat" | "navShop";
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  isActive: (pathname: string) => boolean;
  hasPulse?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "home",
    labelKey: "navHome",
    href: "/",
    icon: Home,
    isActive: (pathname: string) =>
      pathname === "/" || pathname === "/patient" || pathname === "/check-status",
  },
  {
    key: "book",
    labelKey: "navBookNow",
    href: "/patient-registration",
    icon: CalendarCheck,
    isActive: (pathname: string) =>
      pathname === "/patient-registration" ||
      pathname === "/patient/register" ||
      pathname === "/register",
    hasPulse: true,
  },
  {
    key: "treat",
    labelKey: "navWhatWeTreat",
    href: "/what-we-treat",
    icon: Stethoscope,
    isActive: (pathname: string) => pathname === "/what-we-treat",
  },
  {
    key: "shop",
    labelKey: "navShop",
    href: "/shop",
    icon: ShoppingBag,
    isActive: (pathname: string) => pathname === "/shop",
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Do not render on doctor dashboard or doctor login flows
  if (!pathname || pathname.startsWith("/doctor")) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] print:hidden transition-all duration-300"
    >
      <div className="max-w-md sm:max-w-xl mx-auto px-1.5 sm:px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around gap-0.5 sm:gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          const label = t(item.labelKey);

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 group select-none ${
                active
                  ? "text-[#1D68F3] font-bold"
                  : item.hasPulse
                    ? "text-[#1D68F3] hover:text-blue-700 font-bold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 font-medium"
              }`}
            >
              {/* Active pill background effect */}
              {active && (
                <span className="absolute inset-x-1.5 inset-y-1 bg-blue-50/90 rounded-2xl -z-10 animate-fade-in" />
              )}

              {/* Icon Container with Pulse Animations */}
              <div
                className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 ${
                  item.hasPulse ? "animate-nav-pulse" : ""
                }`}
              >
                {/* Soft radiating aura behind pulsing CTA */}
                {item.hasPulse && (
                  <span className="absolute inset-0 rounded-full bg-blue-400/25 animate-nav-aura -z-10 pointer-events-none" />
                )}

                <Icon
                  size={20}
                  strokeWidth={active || item.hasPulse ? 2.4 : 1.9}
                  className={`transition-transform duration-200 ${
                    active
                      ? "scale-105 text-[#1D68F3]"
                      : item.hasPulse
                        ? "text-[#1D68F3] group-hover:text-blue-700"
                        : "text-slate-500 group-hover:text-slate-700"
                  }`}
                />

                {/* Pulsing indicator beacon dot on CTA */}
                {item.hasPulse && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1D68F3] border-2 border-white shadow-xs" />
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] leading-tight text-center tracking-tight truncate max-w-full px-0.5 mt-0.5 ${
                  active
                    ? "font-bold text-[#1D68F3]"
                    : item.hasPulse
                      ? "font-bold text-[#1D68F3]"
                      : "font-semibold text-slate-500"
                }`}
              >
                {label}
              </span>

              {/* Subtle Active Indicator Bar */}
              {active && (
                <span className="absolute -top-1.5 w-7 h-0.5 bg-[#1D68F3] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

