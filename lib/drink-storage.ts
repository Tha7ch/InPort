import type { Restaurant } from "@/types";
import type { DrinkProfile } from "./drink-profile";

/** SQL NULL means untouched; explicit user clearing uses a distinct JSON marker. */
export function encodeDrinkProfile(value: DrinkProfile | null): DrinkProfile | { cleared: true } {
  return value === null ? { cleared: true } : value;
}

/** Keep the storage marker private to the database adapter. API null still means clear. */
export function normalizeRestaurantDrinkStorage(row: Restaurant): Restaurant {
  const value: unknown = row.drink_profile;
  if (value === null || value === undefined) return { ...row, drink_profile: undefined };
  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 1 && "cleared" in value && value.cleared === true) {
    return { ...row, drink_profile: null };
  }
  return row;
}
