function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number) {
  const hour = Math.floor(minutes / 60);

  const ampm = hour >= 12 ? "PM" : "AM";

  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return `${displayHour} ${ampm}`;
}

export const getTimeSlots = (
  startTime: string,
  endTime: string,
  breakStart: string,
  breakEnd: string,
  duration = 60,
) => {
  const slots = [];

  let current = toMinutes(startTime);
  let end = toMinutes(endTime);
  let breakS = toMinutes(breakStart);
  let breakE = toMinutes(breakEnd);

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

  return slots;
};
