import type { Deal, RestaurantWithDeals } from "@/types";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function localTime(now: Date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  return { day: parts.weekday.toLowerCase(), minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

function parseTime(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isActiveDeal(deal: Deal, now: Date = new Date()): boolean {
  const local = localTime(now);
  if (deal.time_start && deal.time_end) {
    const start = parseTime(deal.time_start), end = parseTime(deal.time_end);
    if (start === null || end === null || start === end) return false;
    if (end < start) {
      const yesterday = DAY_NAMES[(DAY_NAMES.indexOf(local.day) + 6) % 7];
      return (deal.days.includes(local.day) && local.minutes >= start) || (deal.days.includes(yesterday) && local.minutes < end);
    }
    return deal.days.includes(local.day) && local.minutes >= start && local.minutes < end;
  }
  // Incomplete time-limited offers cannot be claimed active.
  if (deal.time_start || deal.time_end || deal.type === "happy-hour") return false;
  return deal.days.includes(local.day);
}

export function getActiveDeals(restaurants: RestaurantWithDeals[], now: Date = new Date()): { restaurant: RestaurantWithDeals; activeDeals: Deal[] }[] {
  return restaurants.map(restaurant => ({ restaurant, activeDeals: restaurant.deals.filter(deal => isActiveDeal(deal, now)) }))
    .filter(result => result.activeDeals.length > 0);
}

export function getTonightDeals(restaurants: RestaurantWithDeals[], now: Date = new Date()): { restaurant: RestaurantWithDeals; tonightDeals: Deal[] }[] {
  const day = localTime(now).day;
  return restaurants.map(restaurant => ({ restaurant, tonightDeals: restaurant.deals.filter(deal => deal.days.includes(day)) }))
    .filter(result => result.tonightDeals.length > 0);
}
