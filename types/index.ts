import type { DrinkProfile } from "@/lib/drink-profile";

export interface DayHours {
  open: string;
  close: string;
}

export type OperatingHours = {
  [day in "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"]?: DayHours | null;
};

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  price_tier: number;
  supports_dine_in: boolean;
  supports_takeout: boolean;
  supports_delivery: boolean;
  delivery_platform: string | null;
  vibe_tags: string[];
  favorite_dishes: string[];
  notes: string | null;
  address: string | null;
  google_place_id: string | null;
  operating_hours: OperatingHours | null;
  drink_profile?: DrinkProfile | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  restaurant_id: string;
  description: string;
  type: "recurring" | "happy-hour";
  days: string[];
  time_start: string | null;
  time_end: string | null;
  platform: string;
}

export interface HistoryEntry {
  id: string;
  restaurant_id: string;
  date: string;
  meal_type: string;
  notes: string | null;
  restaurant_name?: string;
}

export interface RestaurantWithDeals extends Restaurant {
  deals: Deal[];
}

export interface Recommendation {
  restaurant_id: string;
  name: string;
  reasoning: string;
  deal_highlight: string | null;
}
