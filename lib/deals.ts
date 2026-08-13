import type { Deal, RestaurantWithDeals } from "@/types";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function isActiveDeal(deal: Deal, now: Date = new Date()): boolean {
  const currentDay = DAY_NAMES[now.getDay()];

  if (!deal.days.includes(currentDay)) return false;

  if (deal.type === "happy-hour" && deal.time_start && deal.time_end) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = deal.time_start.split(":").map(Number);
    const [endH, endM] = deal.time_end.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return true;
}

export function getActiveDeals(restaurants: RestaurantWithDeals[], now: Date = new Date()): { restaurant: RestaurantWithDeals; activeDeals: Deal[] }[] {
  const results: { restaurant: RestaurantWithDeals; activeDeals: Deal[] }[] = [];

  for (const restaurant of restaurants) {
    const activeDeals = restaurant.deals.filter((deal) => isActiveDeal(deal, now));
    if (activeDeals.length > 0) {
      results.push({ restaurant, activeDeals });
    }
  }

  return results;
}

export function getTonightDeals(restaurants: RestaurantWithDeals[], now: Date = new Date()): { restaurant: RestaurantWithDeals; tonightDeals: Deal[] }[] {
  const currentDay = DAY_NAMES[now.getDay()];
  const results: { restaurant: RestaurantWithDeals; tonightDeals: Deal[] }[] = [];

  for (const restaurant of restaurants) {
    const tonightDeals = restaurant.deals.filter((deal) => deal.days.includes(currentDay));
    if (tonightDeals.length > 0) {
      results.push({ restaurant, tonightDeals });
    }
  }

  return results;
}
