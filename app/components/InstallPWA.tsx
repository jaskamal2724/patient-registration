"use client";

import { useEffect, useState } from "react";
import {
  Download,
  CheckCircle2,
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

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isApple = /ipad|iphone|ipod/i.test(ua) && !(window as any).MSStream;
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
    return (
      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 shrink-0">
        <CheckCircle2 size={12} className="text-emerald-600" />
        <span>Installed</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 border border-blue-500 rounded-full px-3 py-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        title="Install MediQueue App"
      >
        <Download size={13} className="text-white" />
        <span>Install App</span>
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
              Install MediQueue App
            </h3>
            <p className="font-body text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Add MediQueue to your phone or desktop home screen for fast 1-tap access.
            </p>

            {isIOS ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-body text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <p>
                    Tap the <strong>Share</strong> button{" "}
                    <Share size={14} className="inline text-blue-600 mx-0.5" />{" "}
                    in Safari navigation bar.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <p>
                    Scroll down and select{" "}
                    <strong>Add to Home Screen</strong>{" "}
                    <PlusSquare
                      size={14}
                      className="inline text-blue-600 mx-0.5"
                    />
                    .
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
                    Tap your browser menu{" "}
                    <MoreVertical
                      size={14}
                      className="inline text-blue-600 mx-0.5"
                    />{" "}
                    (top right 3 dots).
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <p>
                    Select <strong>Install app</strong> or{" "}
                    <strong>Add to Home screen</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-xs font-bold font-body mt-4 transition-all shadow-md cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
