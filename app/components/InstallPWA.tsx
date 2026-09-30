"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  X,
  Smartphone,
} from "lucide-react";

declare global {
  interface Window {
    __deferredPrompt?: any;
  }
}

export default function InstallPWA() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone mode (already installed as PWA)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS (including iPadOS 13+ which reports as Macintosh)
    const ua = window.navigator.userAgent;
    const isApple =
      (/ipad|iphone|ipod/i.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
      !(window as any).MSStream;
    setIsIOS(isApple);

    // Pick up prompt that was captured early (before React mounted)
    if (window.__deferredPrompt) {
      setDeferredPrompt(window.__deferredPrompt);
    }

    // Also listen for future events (in case it fires after mount)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__deferredPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Poll for the deferred prompt in case it was captured before React mounted
    // (Chrome fires beforeinstallprompt very early)
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      if (window.__deferredPrompt) {
        setDeferredPrompt(window.__deferredPrompt);
        clearInterval(pollInterval);
      }
      pollCount++;
      if (pollCount > 50) clearInterval(pollInterval); // stop after 10s
    }, 200);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearInterval(pollInterval);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent =
      deferredPrompt ||
      (typeof window !== "undefined" ? window.__deferredPrompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        if (typeof window !== "undefined") {
          window.__deferredPrompt = null;
        }
      } catch (err) {
        setShowGuideModal(true);
      }
    } else {
      // Native prompt not ready/available (iOS, desktop dev, etc.), show instructions
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 border border-blue-500 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-xs transition-all cursor-pointer shrink-0 w-fit"
        title={t("installPwaBtn")}
      >
        <Download size={12} className="text-white shrink-0" />
        <span>{t("installPwaBtn")}</span>
      </button>

      {/* Guide Modal for devices/browsers where native prompt is not directly triggered */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 animate-slide-up relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Smartphone size={24} />
            </div>

            <h3 className="font-display text-lg font-extrabold text-slate-900 mb-1">
              {t("installAppTitle")}
            </h3>
            <p className="font-body text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              {t("installAppSubtitle")}
            </p>

            {isIOS ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-body text-xs text-slate-700">
                <p className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-1">
                  {t("iosSafariNotice")}
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <p>
                    {t("iosStep1Prefix")}{" "}
                    <strong>{t("iosStep1Bold")}</strong>{" "}
                    <Share size={14} className="inline text-blue-600 mx-0.5" />{" "}
                    {t("iosStep1Suffix")}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <p>
                    {t("iosStep2Prefix")}{" "}
                    <strong>{t("iosStep2Bold")}</strong>{" "}
                    <PlusSquare
                      size={14}
                      className="inline text-blue-600 mx-0.5"
                    />
                    {t("iosStep2Suffix")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-body text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <p>
                    {t("androidStep1Prefix")}{" "}
                    <MoreVertical
                      size={14}
                      className="inline text-blue-600 mx-0.5"
                    />{" "}
                    {t("androidStep1Suffix")}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <p>
                    {t("androidStep2Prefix")}{" "}
                    <strong>{t("androidStep2Bold")}</strong>{" "}
                    {t("androidStep2Middle")}{" "}
                    <strong>{t("androidStep2Bold2")}</strong>
                    {t("androidStep2Suffix")}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-xs font-bold font-body mt-4 transition-all shadow-md cursor-pointer"
            >
              {t("gotIt")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
