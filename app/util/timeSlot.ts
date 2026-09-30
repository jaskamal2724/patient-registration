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

export const getTimeSlots = (
  startTime: string = "09:00",
  endTime: string = "18:00",
  breakStart: string = "13:00",
  breakEnd: string = "14:00",
  duration = 60,
  delayMinutes = 0,
) => {
  const slots = [];

  let start = toMinutes(startTime || "09:00") + delayMinutes;
  let end = toMinutes(endTime || "18:00") + delayMinutes;

  // If end time is before or equal to start time (e.g. start 9 AM [540 min], end 01:00 [60 min] representing 1 PM)
  if (end <= start && end < 12 * 60) {
    end += 12 * 60;
  }

  let breakS = toMinutes(breakStart || "13:00") + delayMinutes;
  let breakE = toMinutes(breakEnd || "14:00") + delayMinutes;

  let current = start;

  while (current + duration <= end) {
    const slotEnd = current + duration;
    const overlapBreak = current < breakE && slotEnd > breakS;

    if (!overlapBreak) {
      slots.push({
        label: `${formatTime(current)} - ${formatTime(slotEnd)}`,
      });
    }

    current += duration;
  }

  // Fallback if no slots generated
  if (slots.length === 0) {
    return [
      { label: `${formatTime(9 * 60 + delayMinutes)} - ${formatTime(10 * 60 + delayMinutes)}` },
      { label: `${formatTime(10 * 60 + delayMinutes)} - ${formatTime(11 * 60 + delayMinutes)}` },
      { label: `${formatTime(11 * 60 + delayMinutes)} - ${formatTime(12 * 60 + delayMinutes)}` },
      { label: `${formatTime(12 * 60 + delayMinutes)} - ${formatTime(13 * 60 + delayMinutes)}` },
      { label: `${formatTime(14 * 60 + delayMinutes)} - ${formatTime(15 * 60 + delayMinutes)}` },
      { label: `${formatTime(15 * 60 + delayMinutes)} - ${formatTime(16 * 60 + delayMinutes)}` },
      { label: `${formatTime(16 * 60 + delayMinutes)} - ${formatTime(17 * 60 + delayMinutes)}` },
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

export function shiftSlotLabel(slotLabel: string | undefined, delayMinutes: number): string {
  if (!slotLabel || delayMinutes <= 0) return slotLabel || "";
  const parts = slotLabel.split(" - ");
  if (parts.length !== 2) return slotLabel;

  const startMin = toMinutes(parts[0]) + delayMinutes;
  const endMin = toMinutes(parts[1]) + delayMinutes;

  return `${formatTime(startMin)} - ${formatTime(endMin)}`;
}

export function normalizeSlotLabel(slot: string | null | undefined): string {
  if (!slot) return "";
  return slot
    .replace(/\b0([0-9]:[0-9]{2})/g, "$1")
    .replace(/\s*[-–]\s*/g, " - ")
    .trim();
}
