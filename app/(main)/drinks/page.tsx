"use client";

import { useEffect, useState, useCallback } from "react";
import type { RestaurantWithDeals } from "@/types";
import PlaceDirectory from "@/components/PlaceDirectory";

export default function DrinksPage() {
  const [restaurants, setRestaurants] = useState<RestaurantWithDeals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadPlaces = useCallback((signal?: AbortSignal) => {
    return fetch("/api/restaurants", { signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load places");
        return response.json();
      })
      .then((places: RestaurantWithDeals[]) => { if (!signal?.aborted) setRestaurants(places); })
      .catch(() => { if (!signal?.aborted) setError("Couldn't load places. Please try again."); })
      .finally(() => { if (!signal?.aborted) setLoading(false); });
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void loadPlaces(controller.signal);
    return () => controller.abort();
  }, [loadPlaces]);
  return <div className="mx-auto max-w-lg px-4 pt-6"><h1 className="text-3xl font-bold" style={{ color: "var(--accent)" }}>Drinks</h1><p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>A drink by the harbor, with time for another.</p><PlaceDirectory restaurants={restaurants} mode="drinks" loading={loading} error={error} onRetry={() => { setLoading(true); setError(null); void loadPlaces(); }} /></div>;
}
