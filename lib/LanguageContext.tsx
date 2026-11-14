"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import i18n, {
  translateDbStatus,
  translateDbGender,
  translateDbDynamic,
  translatePatientName,
} from "./i18n";
import { translations, TranslationKey } from "./translationsData";

export { translations, type TranslationKey };
export type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  tDynamic: (text: string | null | undefined) => string;
  tDelay: (delayMinutes: number) => string;
  tGender: (gender: string | null | undefined) => string;
  tStatus: (status: string | null | undefined) => string;
  tTimeSlot: (slot: string | null | undefined, delayMinutes?: number) => string;
  tTime12Hour: (timeStr: string | null | undefined) => string;
  tWaitTime: (waitMinutes: number) => string;
  tPatientName: (name: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: TranslationKey) => translations.en[key] || key,
  tDynamic: (text) => text || "",
  tDelay: (m) => `${m} mins`,
  tGender: (g) => g || "",
  tStatus: (s) => s || "",
  tTimeSlot: (s) => s || "",
  tTime12Hour: (t) => t || "",
  tWaitTime: (m) =>
    m < 60
      ? `~${m} mins`
      : m % 60 === 0
        ? `~${m / 60} hours`
        : `~${Math.floor(m / 60)} hr ${m % 60} mins`,
  tPatientName: (name) => name || "",
});

export const LANGUAGE_STORAGE_KEY = "mediqueue_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLang === "en" || savedLang === "hi") {
        setLanguageState(savedLang);
        i18n.changeLanguage(savedLang);
        document.documentElement.lang = savedLang;
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      // Use i18n translation with fallback to translationsData
      let str = i18n.t(key as string, { lng: language });
      if (!str || str === key) {
        str = translations[language]?.[key] || translations.en[key] || key;
      }
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return str;
    },
    [language]
  );

  const tDynamic = useCallback(
    (text: string | null | undefined): string => {
      return translateDbDynamic(text, language);
    },
    [language]
  );

  const tPatientName = useCallback(
    (name: string | null | undefined): string => {
      return translatePatientName(name, language);
    },
    [language]
  );

  const tDelay = useCallback(
    (delayMinutes: number): string => {
      if (delayMinutes <= 0) return language === "hi" ? "कोई देरी नहीं" : "No Delay";
      if (delayMinutes < 60) {
        return language === "hi" ? `${delayMinutes} मिनट` : `${delayMinutes} mins`;
      }
      const hours = delayMinutes / 60;
      if (Number.isInteger(hours)) {
        if (language === "hi") {
          return hours === 1 ? "1 घंटा" : `${hours} घंटे`;
        }
        return `${hours} hour${hours > 1 ? "s" : ""}`;
      }
      const formatted = hours.toFixed(1);
      return language === "hi" ? `${formatted} घंटे` : `${formatted} hours`;
    },
    [language]
  );

  const tGender = useCallback(
    (gender: string | null | undefined): string => {
      return translateDbGender(gender, language);
    },
    [language]
  );

  const tStatus = useCallback(
    (status: string | null | undefined): string => {
      return translateDbStatus(status, language);
    },
    [language]
  );

  const tTime12Hour = useCallback(
    (timeStr: string | null | undefined): string => {
      if (!timeStr) return language === "hi" ? "सुबह 10:00" : "10:00 AM";
      const clean = timeStr.trim();
      let isPM = clean.toLowerCase().includes("pm");
      let isAM = clean.toLowerCase().includes("am");
      const timeWithoutPeriod = clean.replace(/(am|pm)/i, "").trim();
      const parts = timeWithoutPeriod.split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10) || 0;

      if (isNaN(hours)) return clean;

      if (!isAM && !isPM) {
        isPM = hours >= 12;
        isAM = hours < 12;
      }

      const hour24 = isPM && hours < 12 ? hours + 12 : isAM && hours === 12 ? 0 : hours;
      const period12 = hour24 >= 12 ? "PM" : "AM";
      let displayHour = hour24 % 12;
      if (displayHour === 0) displayHour = 12;
      const minStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : ":00";
      const hourStr = String(displayHour);

      if (language === "hi") {
        const timeOfDay = hour24 < 12 ? "सुबह" : hour24 >= 16 ? "शाम" : "दोपहर";
        return `${timeOfDay} ${hourStr}${minStr}`;
      }

      return `${hourStr}${minStr} ${period12}`;
    },
    [language]
  );

  const tTimeSlot = useCallback(
    (slot: string | null | undefined, _delayMinutes: number = 0): string => {
      if (!slot) return "";
      if (language === "en") return slot;

      const parts = slot.split(/\s*[-–]\s*/);
      if (parts.length === 2) {
        return `${tTime12Hour(parts[0])} – ${tTime12Hour(parts[1])}`;
      }
      return slot;
    },
    [language, tTime12Hour]
  );

  const tWaitTime = useCallback(
    (waitMinutes: number): string => {
      if (waitMinutes <= 0) {
        return language === "hi" ? "~0 मिनट" : "~0 mins";
      }
      if (waitMinutes < 60) {
        return language === "hi" ? `~${waitMinutes} मिनट` : `~${waitMinutes} mins`;
      }
      const hours = Math.floor(waitMinutes / 60);
      const remMinutes = waitMinutes % 60;

      if (remMinutes === 0) {
        if (language === "hi") {
          return hours === 1 ? "~1 घंटा" : `~${hours} घंटे`;
        }
        return hours === 1 ? "~1 hour" : `~${hours} hours`;
      }

      if (language === "hi") {
        const hrWord = hours === 1 ? "घंटा" : "घंटे";
        return `~${hours} ${hrWord} ${remMinutes} मिनट`;
      }
      return `~${hours} hr ${remMinutes} mins`;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        tDynamic,
        tDelay,
        tGender,
        tStatus,
        tTimeSlot,
        tTime12Hour,
        tWaitTime,
        tPatientName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
