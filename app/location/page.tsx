"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  Clock,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Car,
  Compass,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { CLINIC_ADDRESS, CLINIC_MAP_URL, handleClinicMapClick } from "@/app/util/mapLink";
import { PatientHeader } from "@/app/components/PatientPortal";
import LogiquelAdCard from "@/app/components/LogiquelAdCard";

function LocationContent() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(CLINIC_ADDRESS);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = CLINIC_ADDRESS;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden max-w-full bg-[#FAFAFA] flex flex-col justify-between">
      {/* Header */}
      <PatientHeader
        subtitle={t("navLocation")}
        onExit={() => router.push("/")}
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-md sm:max-w-xl w-full mx-auto px-4 sm:px-5 pb-28 sm:pb-32 flex-1">
        {/* Clinic Location Overview Card */}
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 border border-slate-200/80 shadow-xl shadow-blue-900/5 mb-4 text-left relative overflow-hidden">
          {/* Top Pill Row */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-[#1D68F3] rounded-full px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wide">
              <ShieldCheck size={13} className="text-[#1D68F3]" />
              <span>{t("verifiedClinic")}</span>
            </span>

            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("open")}</span>
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B1527] tracking-tight leading-snug mb-1">
            {t("doctorName")}
          </h1>
          <p className="font-body text-xs sm:text-sm text-slate-500 font-medium mb-4">
            {t("locationPageSubtitle")}
          </p>

          {/* Address Box */}
          <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 mb-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                {t("clinicAddress")}
              </p>
              <p className="font-display text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                {CLINIC_ADDRESS}
              </p>
            </div>
          </div>

          {/* Action Buttons: Open in Maps & Copy */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
            <a
              href={CLINIC_MAP_URL}
              onClick={handleClinicMapClick}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1D68F3] hover:bg-[#1554C6] text-white font-bold text-xs sm:text-sm py-3 px-3.5 rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Navigation size={16} className="shrink-0" />
              <span>{t("openInGoogleMaps")}</span>
              <ExternalLink size={13} className="shrink-0 opacity-80" />
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm py-3 px-3.5 rounded-2xl border border-slate-200/90 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 font-bold">{t("addressCopied")}</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-slate-500 shrink-0" />
                  <span>{t("copyAddress")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Embedded Google Map Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-4">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Compass size={14} className="text-[#1D68F3]" />
              <span>{t("googleMapLocation")}</span>
            </span>
            <a
              href={CLINIC_MAP_URL}
              onClick={handleClinicMapClick}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1D68F3] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>{t("openInGoogleMaps")}</span>
              <ExternalLink size={12} />
            </a>
          </div>
          <div className="w-full h-56 sm:h-64 relative bg-slate-100">
            <iframe
              title="Doctor Sarvesh OPD Clinic Location"
              src="https://maps.google.com/maps?q=28.4428974,77.0055494&hl=en&z=16&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Timings & OPD Hours Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-4 text-left">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1D68F3] flex items-center justify-center">
              <Clock size={16} />
            </div>
            <div>
              <h2 className="font-display text-sm sm:text-base font-extrabold text-slate-900">
                {t("opdTimings")}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {t("daysOpen")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3">
              <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mb-0.5">
                {language === "hi" ? "सुबह का सत्र" : "Morning Session"}
              </p>
              <p className="font-mono-custom text-xs sm:text-sm font-bold text-slate-800">
                09:30 AM – 01:30 PM
              </p>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
              <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider mb-0.5">
                {language === "hi" ? "शाम का सत्र" : "Evening Session"}
              </p>
              <p className="font-mono-custom text-xs sm:text-sm font-bold text-slate-800">
                05:30 PM – 08:30 PM
              </p>
            </div>
          </div>
        </div>

        {/* Landmarks & Parking Guidance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-4 text-left flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <Car size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-sm font-extrabold text-slate-900 mb-1">
              {t("landmarkDirections")}
            </h2>
            <p className="font-body text-xs text-slate-500 leading-relaxed">
              {t("landmarkDesc")}
            </p>
          </div>
        </div>

        {/* Book Consultation Now CTA */}
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
            <span>{t("navBookNow")}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Branding Footer Card */}
        <LogiquelAdCard variant="landing" />
      </main>
    </div>
  );
}

export default function LocationPage() {
  return (
    <Suspense fallback={null}>
      <LocationContent />
    </Suspense>
  );
}

