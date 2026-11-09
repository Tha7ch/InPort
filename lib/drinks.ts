import type { Restaurant } from "@/types";
import { validateDrinkProfile } from "./drink-profile";
import type { DrinkProfile } from "./drink-profile";
export type { DrinkProfile } from "./drink-profile";

const POYNT: DrinkProfile = {
  beer: { min: 5, max: 8 },
  wine: { min: 13, max: 19 },
  cocktails: { min: 15, max: 15 },
  sourceUrl: "https://poyntnewburyport.com/menus",
  checkedAt: "2026-11-08",
  coverage: "Beer: cans and bottles; drafts unpriced. Wine: by the glass; market-price Sancerre excluded.",
};

export function getDrinkProfile(restaurant: Restaurant): DrinkProfile | undefined {
  if (restaurant.drink_profile !== undefined) {
    return restaurant.drink_profile && validateDrinkProfile(restaurant.drink_profile) === null ? restaurant.drink_profile : undefined;
  }
  if (restaurant.id === "166c62ff-a404-42f6-bb9c-3cbdd3b5ad71" || restaurant.name.trim().toLowerCase() === "the poynt") return POYNT;
  return undefined;
}

