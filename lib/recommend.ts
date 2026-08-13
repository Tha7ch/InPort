import Anthropic from "@anthropic-ai/sdk";
import type { RestaurantWithDeals, HistoryEntry, Recommendation } from "@/types";
import { getTonightDeals } from "./deals";

const client = new Anthropic();

interface RecommendOptions {
  restaurants: RestaurantWithDeals[];
  history: HistoryEntry[];
  filters?: {
    cuisine?: string;
    mode?: "dine-in" | "takeout" | "delivery";
    vibes?: string[];
    dealsOnly?: boolean;
  };
  excludeIds?: string[];
}

export async function getRecommendation(options: RecommendOptions): Promise<Recommendation> {
  const { restaurants, history, filters, excludeIds = [] } = options;
  const now = new Date();
  const tonightDeals = getTonightDeals(restaurants, now);
  const dealRestaurantIds = new Set(tonightDeals.map((d) => d.restaurant.id));

  let eligible = restaurants.filter((r) => !excludeIds.includes(r.id));

  if (filters?.cuisine) {
    eligible = eligible.filter((r) => r.cuisine.some((c) => c.toLowerCase() === filters.cuisine!.toLowerCase()));
  }
  if (filters?.mode === "dine-in") {
    eligible = eligible.filter((r) => r.supports_dine_in);
  } else if (filters?.mode === "takeout") {
    eligible = eligible.filter((r) => r.supports_takeout);
  } else if (filters?.mode === "delivery") {
    eligible = eligible.filter((r) => r.supports_delivery);
  }
  if (filters?.vibes && filters.vibes.length > 0) {
    eligible = eligible.filter((r) => filters.vibes!.some((v) => r.vibe_tags.includes(v)));
  }
  if (filters?.dealsOnly) {
    eligible = eligible.filter((r) => dealRestaurantIds.has(r.id));
  }

  if (eligible.length === 0) {
    return {
      restaurant_id: "",
      name: "",
      reasoning: "No restaurants match your current filters. Try broadening your search.",
      deal_highlight: null,
    };
  }

  const restaurantList = eligible
    .map((r) => {
      const deals = tonightDeals.find((d) => d.restaurant.id === r.id);
      const dealStr = deals ? `\n    TONIGHT'S DEALS: ${deals.tonightDeals.map((d) => d.description).join(", ")}` : "";
      return `  - ${r.name} (ID: ${r.id})
    Cuisine: ${r.cuisine.join(", ")} | Price: ${"$".repeat(r.price_tier)}
    Favorite dishes: ${r.favorite_dishes.length > 0 ? r.favorite_dishes.join(", ") : "none listed"}
    Vibes: ${r.vibe_tags.length > 0 ? r.vibe_tags.join(", ") : "none"}
    Serves: ${[r.supports_dine_in && "dine-in", r.supports_takeout && "takeout", r.supports_delivery && "delivery"].filter(Boolean).join(", ")}${dealStr}`;
    })
    .join("\n\n");

  const recentHistory =
    history.length > 0
      ? history
          .slice(0, 10)
          .map((h) => `  - ${h.restaurant_name || h.restaurant_id} on ${h.date} (${h.meal_type})`)
          .join("\n")
      : "  No recent history.";

  const prompt = `Pick ONE restaurant for tonight from the list below. You MUST pick one — never ask for more info.

Restaurants with "TONIGHT'S DEALS" listed are running specials right now — favor those. Avoid the most recent 3 meals in the history unless a deal makes it worth repeating. Rotate cuisines when possible.
${filters?.mode ? `\nThe user wants: ${filters.mode}` : ""}${filters?.cuisine ? `\nCuisine preference: ${filters.cuisine}` : ""}

RESTAURANTS:
${restaurantList}

RECENT HISTORY:
${recentHistory}

Respond with ONLY this JSON (no markdown, no explanation outside the JSON):
{"restaurant_id": "<the restaurant's ID>", "name": "<name>", "reasoning": "<2-3 casual sentences about why this pick — mention any active deal>", "deal_highlight": "<deal description if one exists, otherwise null>"}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const cleaned = text.replace(/```(?:json)?\s*/g, "").trim();

  try {
    return JSON.parse(cleaned) as Recommendation;
  } catch {
    return {
      restaurant_id: eligible[0].id,
      name: eligible[0].name,
      reasoning: text || "Here's a pick for tonight!",
      deal_highlight: null,
    };
  }
}
