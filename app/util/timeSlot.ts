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
) => {
  const slots = [];

  let start = toMinutes(startTime || "09:00");
  let end = toMinutes(endTime || "18:00");

  // If end time is before or equal to start time (e.g. start 9 AM [540 min], end 01:00 [60 min] representing 1 PM)
  if (end <= start && end < 12 * 60) {
    end += 12 * 60;
  }

  let breakS = toMinutes(breakStart || "13:00");
  let breakE = toMinutes(breakEnd || "14:00");

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
      { label: "9:00 AM - 10:00 AM" },
      { label: "10:00 AM - 11:00 AM" },
      { label: "11:00 AM - 12:00 PM" },
      { label: "12:00 PM - 1:00 PM" },
      { label: "2:00 PM - 3:00 PM" },
      { label: "3:00 PM - 4:00 PM" },
      { label: "4:00 PM - 5:00 PM" },
    ];
  }

  return slots;
};
