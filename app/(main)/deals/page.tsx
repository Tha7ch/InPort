"use client";

import { useState, useEffect } from "react";
import type { RestaurantWithDeals, Deal } from "@/types";
import DealBadge from "@/components/DealBadge";

const LOCAL_TIME_ZONE = "America/New_York";

function localDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LOCAL_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function isDealActiveNow(deal: Deal, now: Date): boolean {
  const currentDay = DAY_NAMES[new Date(`${localDateKey(now)}T12:00:00Z`).getUTCDay()];
  if (!deal.days.includes(currentDay)) return false;
  if (deal.type === "happy-hour" && deal.time_start && deal.time_end) {
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: LOCAL_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).format(now);
    const [hour, minute] = time.split(":").map(Number);
    const currentMinutes = hour * 60 + minute;
    const [startH, startM] = deal.time_start.split(":").map(Number);
    const [endH, endM] = deal.time_end.split(":").map(Number);
    return currentMinutes >= startH * 60 + startM && currentMinutes <= endH * 60 + endM;
  }
  return true;
}

export default function DealsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantWithDeals[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    updateClock();
    const timer = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/restaurants");
        if (!res.ok) throw new Error("Unable to load restaurants");
        const data: RestaurantWithDeals[] = await res.json();
        const withDeals = await Promise.all(
          data.map(async (r) => {
            const dealsRes = await fetch(`/api/restaurants/${r.id}/deals`);
            if (!dealsRes.ok) throw new Error("Unable to load deals");
            const deals = await dealsRes.json();
            return { ...r, deals };
          })
        );
        setRestaurants(withDeals);
      } catch {
        setLoadError(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  const today = now ? localDateKey(now) : "";
  const selectedDate = chosenDate || today;
  const selectedDay = selectedDate
    ? DAY_NAMES[new Date(`${selectedDate}T12:00:00Z`).getUTCDay()]
    : "";
  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric",
      }).format(new Date(`${selectedDate}T12:00:00Z`))
    : "";

  const restaurantsWithSelectedDeals = restaurants
    .map((r) => ({
      restaurant: r,
      selectedDeals: r.deals.filter((d) => d.days.includes(selectedDay)),
    }))
    .filter((r) => r.selectedDeals.length > 0);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Deals</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Browse specials in the Newburyport area
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <label htmlFor="deals-date" className="block text-sm font-medium">Choose a date</label>
        <input
          id="deals-date"
          type="date"
          value={selectedDate}
          disabled={!now}
          onChange={(event) => setChosenDate(event.target.value || null)}
          className="min-h-11 w-full rounded-xl border px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
        />
        <div className="flex gap-2">
          {[
            { label: "Today", date: today },
            { label: "Tomorrow", date: today ? shiftDate(today, 1) : "" },
          ].map(({ label, date }) => (
            <button
              key={label}
              type="button"
              disabled={!now}
              aria-pressed={selectedDate === date}
              onClick={() => setChosenDate(label === "Today" ? null : date)}
              className="min-h-11 rounded-full px-4 py-2 text-sm font-medium"
              style={{
                background: selectedDate === date ? "var(--accent)" : "var(--muted-bg)",
                color: selectedDate === date ? "white" : "var(--foreground)",
              }}
            >{label}</button>
          ))}
        </div>
        <p className="text-sm font-medium" aria-live="polite">{dateLabel}</p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>Local Newburyport time. Offers follow each restaurant&apos;s saved weekly schedule.</p>
      </div>

      {loadError && (
        <p role="alert" className="mb-4 text-sm">Couldn&apos;t load deals. Please refresh to try again.</p>
      )}

      {(loading || !now) && (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading deals...</p>
        </div>
      )}

      {!loading && now && !loadError && restaurantsWithSelectedDeals.length === 0 && (
        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <p className="text-4xl mb-3">😔</p>
          <p className="font-medium">No saved deals for {dateLabel}</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Pick another date above or add a deal in Manage.</p>
        </div>
      )}

      <div className="space-y-3">
        {restaurantsWithSelectedDeals.map(({ restaurant, selectedDeals }) => (
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
              {selectedDeals.map((deal) => (
                <div key={deal.id} className="flex items-center gap-1">
                  <DealBadge deal={deal} />
                  {now && selectedDate === today && isDealActiveNow(deal, now) && (
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
