"use client";

import { useState, useEffect } from "react";
import type { RestaurantWithDeals, Deal } from "@/types";
import DealBadge from "@/components/DealBadge";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function isDealActiveNow(deal: Deal): boolean {
  const now = new Date();
  const currentDay = DAY_NAMES[now.getDay()];
  if (!deal.days.includes(currentDay)) return false;
  if (deal.type === "happy-hour" && deal.time_start && deal.time_end) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = deal.time_start.split(":").map(Number);
    const [endH, endM] = deal.time_end.split(":").map(Number);
    return currentMinutes >= startH * 60 + startM && currentMinutes <= endH * 60 + endM;
  }
  return true;
}

export default function DealsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantWithDeals[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/restaurants");
        if (!res.ok) { setLoading(false); return; }
        const data: RestaurantWithDeals[] = await res.json();
        const withDeals = await Promise.all(
          data.map(async (r) => {
            const dealsRes = await fetch(`/api/restaurants/${r.id}/deals`);
            const deals = dealsRes.ok ? await dealsRes.json() : [];
            return { ...r, deals };
          })
        );
        setRestaurants(withDeals);
      } catch {
        /* no db connected */
      }
      setLoading(false);
    }
    load();
  }, []);

  const currentDay = DAY_NAMES[new Date().getDay()];
  const todayLabel = currentDay.charAt(0).toUpperCase() + currentDay.slice(1);

  const restaurantsWithTonightDeals = restaurants
    .map((r) => ({
      restaurant: r,
      tonightDeals: r.deals.filter((d) => d.days.includes(currentDay)),
    }))
    .filter((r) => r.tonightDeals.length > 0);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tonight&apos;s Deals</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {todayLabel} specials in the Newburyport area
        </p>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading deals...</p>
        </div>
      )}

      {!loading && restaurantsWithTonightDeals.length === 0 && (
        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <p className="text-4xl mb-3">😔</p>
          <p className="font-medium">No deals tonight</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Check back tomorrow or add some deals in Manage</p>
        </div>
      )}

      <div className="space-y-3">
        {restaurantsWithTonightDeals.map(({ restaurant, tonightDeals }) => (
          <div
            key={restaurant.id}
            className="rounded-2xl p-4"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-bold">{restaurant.name}</h3>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {restaurant.cuisine.join(", ")} · {"$".repeat(restaurant.price_tier)}
                </p>
              </div>
              <div className="flex gap-1.5">
                {(
                  [
                    restaurant.supports_dine_in ? "Dine-in" : null,
                    restaurant.supports_takeout ? "Takeout" : null,
                    restaurant.supports_delivery ? "Delivery" : null,
                  ].filter((x): x is string => x !== null)
                ).map((label) => (
                    <span
                      key={label}
                      className="rounded-full px-2 py-0.5 text-[10px]"
                      style={{ background: "var(--muted-bg)", color: "var(--muted)" }}
                    >
                      {label}
                    </span>
                  ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tonightDeals.map((deal) => (
                <div key={deal.id} className="flex items-center gap-1">
                  <DealBadge deal={deal} />
                  {isDealActiveNow(deal) && (
                    <span className="text-[10px] font-bold uppercase" style={{ color: "var(--success)" }}>
                      LIVE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
