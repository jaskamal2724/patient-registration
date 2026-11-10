function toMinutes(time: string): number {
  if (!time) return 0;
  const clean = time.trim();
  const isPM = clean.toLowerCase().includes("pm");
  const isAM = clean.toLowerCase().includes("am");
  const cleanedTime = clean.replace(/(am|pm)/i, "").trim();
  const parts = cleanedTime.split(":");
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) || 0;

  if (isNaN(h)) return 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  let hour = Math.floor(normalized / 60);
  const min = normalized % 60;
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minStr = min > 0 ? `:${String(min).padStart(2, "0")}` : ":00";

  return `${displayHour}${minStr} ${ampm}`;
}

export interface TimeSlotItem {
  label: string;
  isLunchBreak?: boolean;
}

export function isLunchSlot(slot: string | null | undefined): boolean {
  if (!slot) return false;
  const s = slot.trim().toLowerCase().replace(/\s+/g, " ");
  return (
    /0?3\s*:\s*00\s*pm\s*[-–]\s*0?4\s*:\s*00\s*pm/i.test(s) ||
    /0?3\s*pm\s*[-–]\s*0?4\s*pm/i.test(s) ||
    s.includes("lunch")
  );
}

export const getTimeSlots = (
  startTime: string = "10:00",
  endTime: string = "19:00",
  breakStart: string = "15:00",
  breakEnd: string = "16:00",
  duration = 60,
  _delayMinutes = 0,
): TimeSlotItem[] => {
  const slots: TimeSlotItem[] = [];

  let start = toMinutes(startTime || "10:00");
  let end = toMinutes(endTime || "19:00");

  // If end time is before or equal to start time (e.g. start 10 AM [600 min], end 07:00 [420 min] representing 7 PM)
  if (end <= start && end < 12 * 60) {
    end += 12 * 60;
  }

  let breakS = toMinutes(breakStart || "15:00");
  let breakE = toMinutes(breakEnd || "16:00");

  let current = start;

  while (current + duration <= end) {
    // If current starts within break or slot overlaps into break, emit lunch slot and advance
    if (current >= breakS && current < breakE) {
      slots.push({
        label: `${formatTime(breakS)} - ${formatTime(breakE)}`,
        isLunchBreak: true,
      });
      current = breakE;
      continue;
    }

    const slotEnd = current + duration;
    const overlapBreak = current < breakE && slotEnd > breakS;

    if (overlapBreak) {
      slots.push({
        label: `${formatTime(breakS)} - ${formatTime(breakE)}`,
        isLunchBreak: true,
      });
      current = breakE;
      continue;
    }

    slots.push({
      label: `${formatTime(current)} - ${formatTime(slotEnd)}`,
      isLunchBreak: false,
    });

    current += duration;
  }

  // Fallback if no slots generated
  if (slots.length === 0) {
    return [
      { label: `${formatTime(10 * 60)} - ${formatTime(11 * 60)}`, isLunchBreak: false },
      { label: `${formatTime(11 * 60)} - ${formatTime(12 * 60)}`, isLunchBreak: false },
      { label: `${formatTime(12 * 60)} - ${formatTime(13 * 60)}`, isLunchBreak: false },
      { label: `${formatTime(13 * 60)} - ${formatTime(14 * 60)}`, isLunchBreak: false },
      { label: `${formatTime(14 * 60)} - ${formatTime(15 * 60)}`, isLunchBreak: false },
      { label: `${formatTime(15 * 60)} - ${formatTime(16 * 60)}`, isLunchBreak: true }, // Lunch 3:00 PM - 4:00 PM
      { label: `${formatTime(16 * 60)} - ${formatTime(17 * 60)}`, isLunchBreak: false },
      { label: `${formatTime(17 * 60)} - ${formatTime(18 * 60)}`, isLunchBreak: false },
      { label: `${formatTime(18 * 60)} - ${formatTime(19 * 60)}`, isLunchBreak: false },
    ];
  }

  return slots;
};

export function formatDelayText(delayMinutes: number): string {
  if (delayMinutes <= 0) return "No Delay";
  if (delayMinutes < 60) return `${delayMinutes} mins`;
  const hours = delayMinutes / 60;
  if (Number.isInteger(hours)) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours.toFixed(1)} hours`;
}

export function formatWaitTime(waitMinutes: number, language: "en" | "hi" = "en"): string {
  if (waitMinutes <= 0) return language === "hi" ? "~0 मिनट" : "~0 mins";
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
}

export function shiftSlotLabel(slotLabel: string | undefined, _delayMinutes?: number): string {
  // Doctor late is treated as an alert; slots are not shifted forward.
  return slotLabel || "";
}

export function normalizeSlotLabel(slot: string | null | undefined): string {
  if (!slot) return "";
  return slot
    .replace(/\b0([0-9]:[0-9]{2})/g, "$1")
    .replace(/\s*[-–]\s*/g, " - ")
    .trim();
}

export function parseSlotStartMinutes(slot: string | null | undefined): number {
  if (!slot) return 99999;
  const clean = slot.trim();
  const firstPartMatch = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!firstPartMatch) {
    const fallbackMatch = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!fallbackMatch) return 99999;
    const [, hStr, mStr, meridiem] = fallbackMatch;
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (meridiem) {
      const isPM = meridiem.toUpperCase() === "PM";
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
    }
    return h * 60 + m;
  }

  const [, hStr, mStr, meridiem] = firstPartMatch;
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  let effectiveMeridiem = meridiem?.toUpperCase();
  if (!effectiveMeridiem && h < 12) {
    if (/\bPM\b/i.test(clean) && !/\bAM\b/i.test(clean) && h <= 11) {
      effectiveMeridiem = "PM";
    }
  }

  if (effectiveMeridiem === "PM" && h < 12) h += 12;
  if (effectiveMeridiem === "AM" && h === 12) h = 0;

  return h * 60 + m;
}

export function sortPatientsBySlot<
  T extends {
    time_slot?: string | null;
    token_number?: number;
    slot_token_number?: number;
    registered_at?: string;
    created_at?: string;
  }
>(patients: T[]): T[] {
  return [...patients].sort((a, b) => {
    // 1. Time Slot Chronological Order (10:00 AM before 11:00 AM)
    const aSlotMin = parseSlotStartMinutes(a.time_slot);
    const bSlotMin = parseSlotStartMinutes(b.time_slot);

    if (aSlotMin !== bSlotMin) {
      return aSlotMin - bSlotMin;
    }

    // 2. Token Number Order within the same slot (Token 1, 2, 3...)
    const aToken = a.slot_token_number ?? a.token_number ?? 0;
    const bToken = b.slot_token_number ?? b.token_number ?? 0;
    if (aToken !== bToken) {
      return aToken - bToken;
    }

    // 3. Fallback tiebreaker: registration timestamp
    const aTime = a.registered_at || a.created_at;
    const bTime = b.registered_at || b.created_at;
    if (aTime && bTime) {
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    }

    return 0;
  });
}

export function parseDateOnly(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim().split("T")[0];
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(clean)) {
    const parts = clean.split(/[-/]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(clean)) {
    const parts = clean.split(/[-/]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getTodayDateOnly(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isDateToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return true;
  const target = parseDateOnly(dateStr);
  if (!target) return true;
  const today = getTodayDateOnly();
  return target.getTime() === today.getTime();
}

export function isDateInFuture(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const target = parseDateOnly(dateStr);
  if (!target) return false;
  const today = getTodayDateOnly();
  return target.getTime() > today.getTime();
}

export function formatVisitDate(
  dateStr: string | null | undefined,
  lang: "en" | "hi" = "en",
): string {
  if (!dateStr) return "";
  const d = parseDateOnly(dateStr);
  if (!d) return dateStr;

  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

