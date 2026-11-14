import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Sanscript from "@indic-transliteration/sanscript";
import { translations } from "./translationsData";

// Structured translations for dynamic database values
const dbTranslations = {
  en: {
    db: {
      status: {
        waiting: "Waiting",
        "in-progress": "In Consultation",
        done: "Completed",
        skipped: "Skipped",
      },
      gender: {
        male: "Male",
        female: "Female",
        other: "Other",
      },
      reason: {
        fever: "Fever",
        cough: "Cough",
        cold: "Cold / Flu",
        headache: "Headache",
        "stomach pain": "Stomach Pain",
        "stomach ache": "Stomach Pain",
        "body pain": "Body Pain",
        "regular checkup": "Regular Checkup",
        checkup: "Checkup",
        "follow up": "Follow-up",
        "follow-up": "Follow-up",
        bp: "Blood Pressure (BP)",
        diabetes: "Diabetes / Sugar",
        sugar: "Sugar",
        weakness: "Weakness / Fatigue",
        infection: "Infection",
        "chest pain": "Chest Pain",
        "back pain": "Back Pain",
        "skin problem": "Skin Problem",
        allergy: "Allergy",
      },
      opd: {
        sessionTitle: "{{name}}'s OPD Session",
        doctorOpd: "Doctor {{name}} OPD",
        closedAt: "Registration closed at {{time}} for today's OPD session ({{date}})",
        sessionClosed: "Registration for {{date}} session is closed",
      },
    },
  },
  hi: {
    db: {
      status: {
        waiting: "प्रतीक्षारत",
        "in-progress": "परामर्श जारी",
        done: "पूर्ण",
        skipped: "छूट गया",
      },
      gender: {
        male: "पुरुष",
        female: "महिला",
        other: "अन्य",
      },
      reason: {
        fever: "बुखार",
        cough: "खांसी",
        cold: "सर्दी-जुकाम",
        headache: "सिरदर्द",
        "stomach pain": "पेट दर्द",
        "stomach ache": "पेट दर्द",
        "body pain": "बदन दर्द",
        "regular checkup": "नियमित जांच",
        checkup: "जांच",
        "follow up": "फॉलो अप",
        "follow-up": "फॉलो अप",
        bp: "रक्तचाप (BP)",
        diabetes: "शुगर",
        sugar: "शुगर",
        weakness: "कमजोरी",
        infection: "संक्रमण",
        "chest pain": "सीने में दर्द",
        "back pain": "पीठ दर्द",
        "skin problem": "त्वचा की समस्या",
        allergy: "एलर्जी",
      },
      opd: {
        sessionTitle: "{{name}} का ओपीडी सत्र",
        doctorOpd: "डॉक्टर {{name}} ओपीडी",
        closedAt: "आज के ओपीडी सत्र ({{date}}) के लिए पंजीकरण {{time}} पर बंद हो गया।",
        sessionClosed: "{{date}} सत्र के लिए पंजीकरण बंद है।",
      },
    },
  },
};

export const resources = {
  en: {
    translation: {
      ...translations.en,
      ...dbTranslations.en,
    },
  },
  hi: {
    translation: {
      ...translations.hi,
      ...dbTranslations.hi,
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;

/**
 * Pure algorithmic transliteration from Romanized English to Devanagari (Hindi)
 * using @indic-transliteration/sanscript with Hindi schwa deletion (syncope).
 * No static dictionary of names is needed.
 */
export function transliterateToHindi(input: string): string {
  if (!input || !input.trim()) return input || "";

  // Split into tokens preserving spaces and punctuation
  return input
    .split(/(\s+|[.,/#!$%^&*;:{}=\-_`~()])/g)
    .map((word) => {
      if (!word || /^\s+$/.test(word) || /^[.,/#!$%^&*;:{}=\-_`~()]+$/.test(word)) {
        return word;
      }

      const lower = word.toLowerCase();

      // Common honorifics and short titles
      if (lower === "dr" || lower === "dr.") return "डॉ.";
      if (lower === "mr" || lower === "mr.") return "श्री";
      if (lower === "mrs" || lower === "mrs." || lower === "ms" || lower === "ms.") return "श्रीमती";

      // If word contains numbers or already non-Latin characters, return as is
      if (/[0-9]/.test(word) || !/^[a-zA-Z.]+$/.test(word)) {
        return word;
      }

      // Pre-process romanized Hindi spelling conventions for ITRANS
      let itrans = lower
        .replace(/ee/g, "I")
        .replace(/oo/g, "U")
        .replace(/aa/g, "A")
        .replace(/sh/g, "sh")
        .replace(/kh/g, "kh")
        .replace(/gh/g, "gh")
        .replace(/ch/g, "ch")
        .replace(/jh/g, "jh")
        .replace(/th/g, "th")
        .replace(/dh/g, "dh")
        .replace(/ph/g, "ph")
        .replace(/bh/g, "bh");

      // Female names ending with short 'a' in English (e.g. Priya, Pooja, Sneha, Neha, Ritu) -> long 'A'
      if (/[bcdfghjklmnpqrstvwxyz]a$/i.test(itrans)) {
        itrans = itrans.slice(0, -1) + "A";
      }

      // Common phonetic normalization for Indian names
      if (itrans === "kumar") itrans = "kumAr";
      if (itrans === "singh") itrans = "siMha";
      if (itrans === "sharma") itrans = "sharmA";
      if (itrans === "verma") itrans = "varmA";
      if (itrans === "gupta") itrans = "guptA";
      if (itrans === "yadav") itrans = "yAdav";

      try {
        let devanagari = Sanscript.t(itrans, "itrans", "devanagari", { syncope: true });
        // Clean any stray halant at the end of standalone words
        devanagari = devanagari.replace(/्$/, "");
        return devanagari;
      } catch {
        return word;
      }
    })
    .join("");
}

/**
 * Dynamic DB status translator via i18n
 */
export function translateDbStatus(status: string | null | undefined, lang: "en" | "hi"): string {
  if (!status) return "";
  const key = `db.status.${status.toLowerCase()}`;
  const translated = i18n.t(key, { lng: lang });
  if (translated && translated !== key) return translated;
  return status;
}

/**
 * Dynamic DB gender translator via i18n
 */
export function translateDbGender(gender: string | null | undefined, lang: "en" | "hi"): string {
  if (!gender) return "";
  const key = `db.gender.${gender.toLowerCase()}`;
  const translated = i18n.t(key, { lng: lang });
  if (translated && translated !== key) return translated;
  return gender;
}

/**
 * Dynamic DB consultation reason translator via i18n
 */
export function translateDbReason(reason: string | null | undefined, lang: "en" | "hi"): string {
  if (!reason) return "";
  if (lang === "en") return reason;
  const key = `db.reason.${reason.toLowerCase().trim()}`;
  const translated = i18n.t(key, { lng: "hi" });
  if (translated && translated !== key) return translated;
  return reason;
}

/**
 * Dynamic Patient Name translator:
 * When lang is "hi", uses algorithmic Sanscript transliteration.
 * When lang is "en", returns the original English text directly from DB.
 */
export function translatePatientName(name: string | null | undefined, lang: "en" | "hi"): string {
  if (!name) return "";
  if (lang === "en") return name;
  return transliterateToHindi(name);
}

/**
 * Dynamic DB freeform text / message translator via i18n templates
 */
export function translateDbDynamic(text: string | null | undefined, lang: "en" | "hi"): string {
  if (!text) return "";
  if (lang === "en") return text;

  const clean = text.trim();

  // Pattern: "[Doctor Name]'s OPD Session"
  if (/'s OPD Session/i.test(clean)) {
    const docName = clean.replace(/'s OPD Session/i, "").trim();
    const translatedName = transliterateToHindi(docName);
    return i18n.t("db.opd.sessionTitle", { name: translatedName, lng: "hi" });
  }

  // Pattern: "Doctor [Name] OPD"
  const docMatch = clean.match(/^(Dr\.?|Doctor)\s+([A-Za-z\s]+)\s+OPD$/i);
  if (docMatch) {
    const translatedName = transliterateToHindi(docMatch[2].trim());
    return i18n.t("db.opd.doctorOpd", { name: translatedName, lng: "hi" });
  }

  // Pattern: "Registration closed at [Time] for today's OPD session ([Date])"
  if (clean.includes("Registration closed at") && clean.includes("for today's OPD session")) {
    const timeMatch = clean.match(/Registration closed at ([0-9:AMPamp\s]+) for/);
    const dateMatch = clean.match(/\((.*?)\)/);
    const timeStr = timeMatch ? timeMatch[1].trim() : "10:00 AM";
    const dateStr = dateMatch ? dateMatch[1].trim() : "";
    return i18n.t("db.opd.closedAt", { time: timeStr, date: dateStr, lng: "hi" });
  }

  // Pattern: "Registration for [Date] session is closed"
  if (clean.includes("session is closed")) {
    const dateMatch = clean.match(/Registration for (.*?) session is closed/i);
    const dateStr = dateMatch ? dateMatch[1].trim() : "";
    return i18n.t("db.opd.sessionClosed", { date: dateStr, lng: "hi" });
  }

  // Fallback to checking reason dictionary
  const reasonKey = `db.reason.${clean.toLowerCase()}`;
  const translatedReason = i18n.t(reasonKey, { lng: "hi" });
  if (translatedReason && translatedReason !== reasonKey) {
    return translatedReason;
  }

  return clean;
}

