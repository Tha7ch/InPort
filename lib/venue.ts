import type { DayHours, OperatingHours } from "@/types";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const localFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

function localParts(now: Date) {
  const parts = Object.fromEntries(localFormatter.formatToParts(now).map(({ type, value }) => [type, value]));
  return { date: Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)), minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

function clock(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function interval(hours: DayHours | null | undefined) {
  if (!hours || typeof hours.open !== "string" || typeof hours.close !== "string") return null;
  const open = clock(hours.open), close = clock(hours.close);
  return open === null || close === null || open === close ? null : { open, close };
}

function display(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, "0")}` : ""} ${hour >= 12 ? "PM" : "AM"}`;
}

// Match both contemporary New York offsets, including repeated fall-back times.
function minutesUntil(date: number, minutes: number, now: Date): number {
  const candidates = [4, 5].map(offset => date + minutes * 60_000 + offset * 3_600_000)
    .filter(instant => {
      const local = localParts(new Date(instant));
      return local.date === date && local.minutes === minutes && instant > now.getTime();
    });
  return candidates.length ? (Math.min(...candidates) - now.getTime()) / 60_000 : Infinity;
}

export interface VenueStatus {
  state: "open" | "closed" | "unknown";
  label: string;
  closingSoon: boolean;
}

export function getVenueStatus(hours: OperatingHours | null | undefined, now: Date = new Date()): VenueStatus {
  const unknown: VenueStatus = { state: "unknown", label: "Hours not verified", closingSoon: false };
  if (!hours || !Number.isFinite(now.getTime())) return unknown;
  const local = localParts(now);
  const dayIndex = new Date(local.date).getUTCDay();
  const today = interval(hours[DAYS[dayIndex]]);
  const yesterday = interval(hours[DAYS[(dayIndex + 6) % 7]]);
  let closing: { date: number; minutes: number } | undefined;
  if (yesterday && yesterday.close < yesterday.open && local.minutes < yesterday.close) {
    closing = { date: local.date, minutes: yesterday.close };
  }
  if (today && local.minutes >= today.open && (today.close < today.open || local.minutes < today.close)) {
    closing = { date: local.date + (today.close < today.open ? 86_400_000 : 0), minutes: today.close };
  }
  if (closing) {
    const closingSoon = minutesUntil(closing.date, closing.minutes, now) <= 60;
    return { state: "open", label: `${closingSoon ? "Closing soon" : "Open"} · Closes at ${display(closing.minutes)}`, closingSoon };
  }
  if (!today && hours[DAYS[dayIndex]] !== null) return unknown;
  let missingEarlierHours = false;
  for (let offset = 0; offset <= 7; offset++) {
    const next = interval(hours[DAYS[(dayIndex + offset) % 7]]);
    if (!next) {
      if (hours[DAYS[(dayIndex + offset) % 7]] !== null) missingEarlierHours = true;
      continue;
    }
    if (offset === 0 && next.open <= local.minutes) continue;
    const day = offset === 0 ? "today" : offset === 1 ? "tomorrow" : DAYS[(dayIndex + offset) % 7];
    return { state: "closed", label: `Closed · ${missingEarlierHours ? "Next known opening" : "Opens"} ${day} at ${display(next.open)}`, closingSoon: false };
  }
  return { state: "closed", label: "Closed · Next opening not verified", closingSoon: false };
}

