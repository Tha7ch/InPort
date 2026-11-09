"use client";

import type { Recommendation, RestaurantWithDeals } from "@/types";

interface Props {
  recommendation: Recommendation;
  restaurant?: RestaurantWithDeals;
  onNext: () => void;
  onLockIn: () => void;
  loading?: boolean;
}

export default function RecommendationCard({ recommendation, restaurant, onNext, onLockIn, loading }: Props) {
  if (!recommendation.restaurant_id) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <p className="text-lg" style={{ color: "var(--muted)" }}>{recommendation.reasoning}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{recommendation.name}</h2>
          {restaurant && (
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {restaurant.cuisine.join(", ")} · {"$".repeat(restaurant.price_tier)}
              {restaurant.vibe_tags.length > 0 && ` · ${restaurant.vibe_tags.join(", ")}`}
            </p>
          )}
        </div>
      </div>

      {recommendation.deal_highlight && (
        <div className="mb-4 rounded-xl px-4 py-3" style={{ background: "var(--deal-bg)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--deal)" }}>
            🏷 {recommendation.deal_highlight}
          </p>
        </div>
      )}

      <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        {recommendation.reasoning}
      </p>

      {restaurant && restaurant.favorite_dishes.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Your favorites
          </p>
          <div className="flex flex-wrap gap-1.5">
            {restaurant.favorite_dishes.map((dish) => (
              <span key={dish} className="rounded-full px-2.5 py-1 text-xs" style={{ background: "var(--muted-bg)" }}>
                {dish}
              </span>
            ))}
          </div>
        </div>
      )}

      {restaurant?.address && (
        <p className="mb-4 text-xs" style={{ color: "var(--muted)" }}>
          📍 {restaurant.address}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors"
          style={{ background: "var(--muted-bg)", color: "var(--foreground)" }}
        >
          Next pick
        </button>
        <button
          onClick={onLockIn}
          disabled={loading}
          className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-colors"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          Lock it in
        </button>
      </div>
    </div>
  );
}
