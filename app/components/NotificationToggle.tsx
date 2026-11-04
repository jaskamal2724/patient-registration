"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing, BellOff, X, RefreshCw, SlidersHorizontal, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationEnabledInApp,
  setNotificationEnabledInApp,
  sendBrowserNotification,
} from "@/lib/browserNotification";
import { useLanguage } from "@/lib/LanguageContext";

interface NotificationToggleProps {
  className?: string;
}

export default function NotificationToggle({ className = "" }: NotificationToggleProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recheckLoading, setRecheckLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [recheckMsg, setRecheckMsg] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState(true);

  const syncState = () => {
    if (!isNotificationSupported()) {
      setSupported(false);
      setPermission("unsupported");
      setEnabled(false);
      return;
    }
    const perm = getNotificationPermission();
    setPermission(perm);
    setEnabled(isNotificationEnabledInApp());
    if (typeof window !== "undefined") {
      setIsSecure(window.isSecureContext);
    }
  };

  useEffect(() => {
    setMounted(true);
    syncState();

    const handleUpdate = () => syncState();
    window.addEventListener("doccare-notification-change", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    return () => {
      window.removeEventListener("doccare-notification-change", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  if (!mounted || !supported || permission === "unsupported") {
    return null;
  }

  const handleToggle = async () => {
    if (loading) return;
    setRecheckMsg(null);

    // If currently denied, open the interactive step-by-step unblock modal
    if (permission === "denied") {
      setShowBlockedModal(true);
      return;
    }

    if (permission === "default") {
      setLoading(true);
      try {
        const res = await requestNotificationPermission();
        setPermission(res);
        if (res === "granted") {
          setNotificationEnabledInApp(true);
          setEnabled(true);
          await sendBrowserNotification({
            title: "🔔 Alerts Active - Doctor OPD",
            body: "Notifications enabled! You will receive live alerts when your turn approaches or if doctor is running late.",
            tag: "notification-welcome",
          });
        } else if (res === "denied") {
          setShowBlockedModal(true);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Permission is granted, toggle app preference
    const nextState = !enabled;
    setNotificationEnabledInApp(nextState);
    setEnabled(nextState);

    if (nextState) {
      await sendBrowserNotification({
        title: "🔔 Alerts Re-enabled",
        body: "Live alerts are now active for your turn and doctor delays.",
        tag: "notification-resume",
      });
    }
  };

  const handleRecheckPermission = async () => {
    setRecheckLoading(true);
    setRecheckMsg(null);
    try {
      syncState();
      const currentPerm = getNotificationPermission();

      if (currentPerm === "granted") {
        setNotificationEnabledInApp(true);
        setEnabled(true);
        setRecheckMsg("success");
        setTimeout(async () => {
          setShowBlockedModal(false);
          await sendBrowserNotification({
            title: "🔔 Alerts Active - Doctor OPD",
            body: "Notifications enabled! You will receive live alerts when your turn approaches or if doctor is running late.",
            tag: "notification-welcome",
          });
        }, 800);
        return;
      }

      if (currentPerm === "default") {
        // Permission was reset to Ask! Browser will now show native popup
        const res = await requestNotificationPermission();
        setPermission(res);
        if (res === "granted") {
          setNotificationEnabledInApp(true);
          setEnabled(true);
          setRecheckMsg("success");
          setTimeout(async () => {
            setShowBlockedModal(false);
            await sendBrowserNotification({
              title: "🔔 Alerts Active - Doctor OPD",
              body: "Notifications enabled! You will receive live alerts when your turn approaches or if doctor is running late.",
              tag: "notification-welcome",
            });
          }, 800);
        } else if (res === "denied") {
          setRecheckMsg("still_denied");
        }
        return;
      }

      setRecheckMsg("still_denied");
    } finally {
      setRecheckLoading(false);
    }
  };

  const isBlocked = permission === "denied";
  const isActive = enabled && permission === "granted";

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        title={
          isBlocked
            ? t("notificationBlockedHelp")
            : isActive
            ? "Click to disable notifications"
            : "Click to enable notifications"
        }
        aria-label={isActive ? "Disable notifications" : "Enable notifications"}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs select-none cursor-pointer border active:scale-95 ${
          isBlocked
            ? "bg-amber-50 hover:bg-amber-100/90 border-amber-200 text-amber-800"
            : isActive
            ? "bg-emerald-50 hover:bg-emerald-100/90 border-emerald-200 text-emerald-800"
            : "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-600"
        } ${className}`}
      >
        {/* Bell Icon */}
        {isBlocked ? (
          <BellOff size={12} className="text-amber-600 shrink-0" />
        ) : isActive ? (
          <BellRing size={12} className="text-emerald-600 animate-pulse shrink-0" />
        ) : (
          <Bell size={12} className="text-slate-500 shrink-0" />
        )}

        {/* Text Status */}
        <span className="tracking-tight leading-none">
          {loading
            ? "..."
            : isBlocked
            ? t("notificationBlocked")
            : isActive
            ? t("notificationToggleOn")
            : t("notificationToggleOff")}
        </span>

        {/* Visual Switch Track */}
        {!isBlocked && (
          <span
            className={`relative inline-flex h-3.5 w-6 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
              isActive ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                isActive ? "translate-x-2.5" : "translate-x-0"
              }`}
            />
          </span>
        )}
      </button>

      {/* Blocked Help Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-left animate-slide-up relative overflow-hidden">
            <button
              onClick={() => setShowBlockedModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <BellOff size={20} />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  {t("notificationBlocked")}
                </h3>
                <p className="font-body text-[11px] text-slate-500">
                  Why no popup is showing & how to enable it
                </p>
              </div>
            </div>

            {/* Insecure Origin Notice if accessing via IP */}
            {!isSecure && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-3.5 text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Insecure Address:</strong> Browsers require HTTPS or <code className="bg-red-100 px-1 py-0.5 rounded font-mono">http://localhost:3000</code> to show notification prompts. Please access the app via localhost instead of a network IP address.
                </p>
              </div>
            )}

            {/* Explanation */}
            <p className="font-body text-xs text-slate-600 leading-relaxed mb-4">
              Browsers like Chrome and Edge have a strict security rule: once a site is marked as blocked or dismissed, <strong>the browser prevents websites from displaying the popup again</strong>. You must allow it directly in your browser address bar:
            </p>

            {/* 3 Step Visual Guide */}
            <div className="space-y-2.5 mb-5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    Click the Site Settings icon
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600">
                      <SlidersHorizontal size={10} /> Tune / Lock
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Look at the browser address bar at the top, immediately to the left of the URL.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900">
                    Switch Notifications to &quot;Allow&quot;
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Find <strong>Notifications</strong> in the dropdown menu and change it from <em>Block</em> to <em>Allow</em> (or click <em>Reset permission</em>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900">
                    Click &quot;Check Again&quot; Below
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Once updated, click the button below to activate notifications immediately without refreshing.
                  </p>
                </div>
              </div>
            </div>

            {/* Recheck Feedback message */}
            {recheckMsg === "success" && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Permission granted! Enabling live alerts now...</span>
              </div>
            )}
            {recheckMsg === "still_denied" && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                <span>Still blocked. Please change Notifications to &quot;Allow&quot; in the address bar dropdown first.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRecheckPermission}
                disabled={recheckLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
              >
                <RefreshCw size={13} className={recheckLoading ? "animate-spin" : ""} />
                <span>{recheckLoading ? "Checking..." : "Check Again / Try Prompt"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBlockedModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
