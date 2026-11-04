"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing, BellOff, Check } from "lucide-react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  setNotificationEnabledInApp,
} from "@/lib/browserNotification";
import { useLanguage } from "@/lib/LanguageContext";

interface NotificationPermissionCardProps {
  className?: string;
  onPermissionGranted?: () => void;
}

export default function NotificationPermissionCard({
  className = "",
  onPermissionGranted,
}: NotificationPermissionCardProps) {
  const { t } = useLanguage();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  if (permission === "unsupported") {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    try {
      const res = await requestNotificationPermission();
      setPermission(res);
      if (res === "granted") {
        setNotificationEnabledInApp(true);
        onPermissionGranted?.();
        // Send initial confirmation notification
        await sendBrowserNotification({
          title: "🔔 Alerts Active - Doctor OPD",
          body: "Notifications enabled! You will receive live alerts when your turn approaches or if doctor is running late.",
          tag: "notification-welcome",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const [testLoading, setTestLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleTest = async () => {
    if (testLoading) return;
    setTestLoading(true);
    setFeedback(null);
    try {
      const { testBrowserNotification } = await import("@/lib/browserNotification");
      const res = await testBrowserNotification();
      setFeedback({ ok: res.ok, msg: res.message });
      setTimeout(() => setFeedback(null), 8000);
    } catch {
      setFeedback({ ok: false, msg: "Failed to dispatch test alert." });
      setTimeout(() => setFeedback(null), 6000);
    } finally {
      setTestLoading(false);
    }
  };

  if (permission === "granted") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div
          className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 text-left shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <BellRing size={16} className="text-emerald-700 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="font-body text-xs sm:text-[13px] font-extrabold text-emerald-950 truncate">
                {t("notificationsEnabled")}
              </p>
              <p className="font-body text-[11px] text-emerald-700 font-semibold truncate">
                Turn & delay alerts are active on this device
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleTest}
              disabled={testLoading}
              className="inline-flex items-center gap-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-95 shadow-2xs disabled:opacity-50"
            >
              <Bell size={11} className="text-emerald-700" />
              <span>{testLoading ? "Sending..." : "Test Alert"}</span>
            </button>
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-full shrink-0 shadow-2xs">
              <Check size={11} />
              <span>Active</span>
            </span>
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-xl p-2.5 text-left text-xs font-medium border flex items-start gap-2 animate-fadeIn ${
              feedback.ok
                ? "bg-emerald-100/90 border-emerald-300 text-emerald-900"
                : "bg-amber-100/90 border-amber-300 text-amber-950"
            }`}
          >
            <span className="shrink-0 text-sm">{feedback.ok ? "🔔" : "⚠️"}</span>
            <div className="min-w-0">
              <p className="font-bold">{feedback.msg}</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                On Android, pull down the notification shade from the very top of your phone screen.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div
        className={`bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-2.5 text-left text-xs text-slate-500 font-medium ${className}`}
      >
        <BellOff size={16} className="text-slate-400 shrink-0" />
        <span className="text-[11px]">
          Notifications blocked in browser settings. Enable them to get turn alerts.
        </span>
      </div>
    );
  }

  // Default: Prompt to enable
  return (
    <div
      className={`bg-gradient-to-r from-blue-50/95 via-indigo-50/90 to-blue-50/95 border border-blue-200/90 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${className}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <Bell size={16} className="text-blue-700" />
        </div>
        <div>
          <h4 className="font-body text-xs sm:text-[13px] font-extrabold text-blue-950 leading-snug">
            {t("enableTurnAlerts")}
          </h4>
          <p className="font-body text-[11px] sm:text-xs text-blue-800/80 font-medium leading-relaxed mt-0.5">
            {t("notificationPromptMsg")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleEnable}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-body text-xs font-bold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-60"
      >
        <Bell size={14} className="shrink-0" />
        <span>{loading ? "..." : t("enableNotifications")}</span>
      </button>
    </div>
  );
}
