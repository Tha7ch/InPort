"use client";

import { useState, useEffect, useCallback } from "react";
import type { RestaurantWithDeals, Recommendation } from "@/types";
import RecommendationCard from "@/components/RecommendationCard";
import FilterBar from "@/components/FilterBar";
import PlaceDirectory from "@/components/PlaceDirectory";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<RestaurantWithDeals[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [lockedIn, setLockedIn] = useState(false);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({ cuisine: "", mode: "", dealsOnly: false });

  const loadPlaces = useCallback((signal?: AbortSignal) => {
    return fetch("/api/restaurants", { signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load places");
        return response.json();
      })
      .then((places: RestaurantWithDeals[]) => { if (!signal?.aborted) setRestaurants(places); })
      .catch(() => { if (!signal?.aborted) setPlacesError("Couldn't load places. Please try again."); })
      .finally(() => { if (!signal?.aborted) setPlacesLoading(false); });
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void loadPlaces(controller.signal);
    return () => controller.abort();
  }, [loadPlaces]);

  const cuisines = [...new Set(restaurants.flatMap((r) => r.cuisine))].sort();

  async function requestRecommendation(nextExcludes: string[]) {
    setLoading(true);
    setLockedIn(false);
    setRecommendationError(null);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, excludeIds: nextExcludes }),
      });
      if (!response.ok) throw new Error("Unable to get a recommendation");
      const rec: Recommendation = await response.json();
      if (typeof rec.reasoning !== "string") throw new Error("Invalid recommendation");
      setRecommendation(rec);
      setExcludeIds(nextExcludes);
    } catch {
      setRecommendationError("Surprise me is unavailable right now. You can still browse the places below.");
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    const nextExcludes = recommendation?.restaurant_id ? [...excludeIds, recommendation.restaurant_id] : excludeIds;
    await requestRecommendation(nextExcludes);
  }

  async function handleLockIn() {
    if (!recommendation?.restaurant_id || saving || lockedIn) return;
    setSaving(true);
    setRecommendationError(null);
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: recommendation.restaurant_id, meal_type: filters.mode || "dine-in" }),
      });
      if (!response.ok) throw new Error("Unable to save pick");
      setLockedIn(true);
    } catch {
      setRecommendationError("Couldn't save your pick. Please try Lock it in again.");
    } finally {
      setSaving(false);
    }
  }

  const matchedRestaurant = restaurants.find((r) => r.id === recommendation?.restaurant_id);
  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <header className="mb-6"><p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>InPort</p><h1 className="mt-1 text-3xl font-bold" style={{ color: "var(--accent)" }}>Food</h1><p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>What are we eating tonight?</p></header>
      <FilterBar filters={filters} onChange={setFilters} cuisines={cuisines} />
      <div className="mt-6">
        {!recommendation && !loading && <button onClick={() => requestRecommendation(excludeIds)} className="w-full rounded-2xl py-5 text-lg font-bold transition-transform active:scale-[0.98]" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>Surprise me</button>}
        {loading && <div role="status" className="rounded-2xl border py-8 text-center" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}><p className="text-sm font-medium" style={{ color: "var(--muted)" }}>Finding your spot…</p></div>}
        {recommendation && !loading && <div><RecommendationCard recommendation={recommendation} restaurant={matchedRestaurant} onNext={handleNext} onLockIn={handleLockIn} loading={saving} />{!recommendation.restaurant_id && <button onClick={() => requestRecommendation([])} className="mt-3 w-full rounded-xl py-3 text-sm font-semibold" style={{ background: "var(--muted-bg)" }}>Try again with these filters</button>}{lockedIn && <div role="status" className="mt-4 rounded-xl p-4 text-center" style={{ background: "var(--deal-bg)" }}><p className="text-sm font-semibold" style={{ color: "var(--deal)" }}>Locked in! Enjoy {recommendation.name} tonight.</p></div>}</div>}
        {recommendationError && <p role="alert" className="mt-3 text-sm" style={{ color: "var(--muted)" }}>{recommendationError}</p>}
      </div>
      <PlaceDirectory restaurants={restaurants} mode="food" loading={placesLoading} error={placesError} onRetry={() => { setPlacesLoading(true); setPlacesError(null); void loadPlaces(); }} filters={filters} />
    </div>
  );
}
