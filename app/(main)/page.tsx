"use client";

import { useState, useEffect } from "react";
import type { RestaurantWithDeals, Recommendation } from "@/types";
import RecommendationCard from "@/components/RecommendationCard";
import FilterBar from "@/components/FilterBar";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<RestaurantWithDeals[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockedIn, setLockedIn] = useState(false);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({ cuisine: "", mode: "", dealsOnly: false });

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => r.ok ? r.json() : [])
      .then(setRestaurants)
      .catch(() => setRestaurants([]));
  }, []);

  const cuisines = [...new Set(restaurants.flatMap((r) => r.cuisine))].sort();

  async function handleRecommend() {
    setLoading(true);
    setLockedIn(false);
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters, excludeIds }),
    });
    const rec: Recommendation = await res.json();
    setRecommendation(rec);
    setLoading(false);
  }

  async function handleNext() {
    if (recommendation?.restaurant_id) {
      setExcludeIds((prev) => [...prev, recommendation.restaurant_id]);
    }
    const newExcludes = recommendation?.restaurant_id
      ? [...excludeIds, recommendation.restaurant_id]
      : excludeIds;

    setLoading(true);
    setLockedIn(false);
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters, excludeIds: newExcludes }),
    });
    const rec: Recommendation = await res.json();
    setRecommendation(rec);
    setLoading(false);
  }

  async function handleLockIn() {
    if (!recommendation?.restaurant_id) return;
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurant_id: recommendation.restaurant_id,
        meal_type: filters.mode || "dine-in",
      }),
    });
    setLockedIn(true);
  }

  const matchedRestaurant = restaurants.find((r) => r.id === recommendation?.restaurant_id);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          <span style={{ color: "var(--accent)" }}>InPort</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          What are we eating tonight?
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} cuisines={cuisines} />

      <div className="mt-6">
        {!recommendation && !loading && (
          <button
            onClick={handleRecommend}
            className="w-full rounded-2xl py-5 text-lg font-bold text-white transition-transform active:scale-[0.98]"
            style={{ background: "var(--accent)" }}
          >
            Surprise me
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center rounded-2xl py-12" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="text-center">
              <div className="mb-3 text-4xl animate-bounce">🍽</div>
              <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>Finding your spot...</p>
            </div>
          </div>
        )}

        {recommendation && !loading && (
          <div>
            <RecommendationCard
              recommendation={recommendation}
              restaurant={matchedRestaurant}
              onNext={handleNext}
              onLockIn={handleLockIn}
              loading={loading}
            />
            {lockedIn && (
              <div className="mt-4 rounded-xl p-4 text-center" style={{ background: "var(--deal-bg)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>
                  Locked in! Enjoy {recommendation.name} tonight.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
