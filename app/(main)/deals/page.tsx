"use client";

import { useState, useEffect } from "react";
import type { RestaurantWithDeals } from "@/types";
import { isActiveDeal } from "@/lib/deals";
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

export default function DealsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantWithDeals[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<string | null>(null);

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

  const visibleMonth = calendarMonth || selectedDate.slice(0, 7);
  const monthStart = visibleMonth ? new Date(`${visibleMonth}-01T12:00:00Z`) : null;
  const monthOffset = monthStart?.getUTCDay() ?? 0;
  const monthDays = monthStart
    ? new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)).getUTCDate()
    : 0;
  const monthLabel = monthStart
    ? new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", year: "numeric" }).format(monthStart)
    : "";
  function moveMonth(offset: number) {
    if (!monthStart) return;
    const target = new Date(monthStart);
    target.setUTCMonth(target.getUTCMonth() + offset);
    setCalendarMonth(target.toISOString().slice(0, 7));
  }
  function closeCalendar() {
    setCalendarOpen(false);
    document.querySelector<HTMLButtonElement>('[aria-controls="deals-calendar"]')?.focus();
  }

  const restaurantsWithSelectedDeals = restaurants
    .map((r) => ({
      restaurant: r,
      selectedDeals: r.deals.filter((d) => d.days.includes(selectedDay) || (now !== null && selectedDate === today && isActiveDeal(d, now))),
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
        <span id="date-picker-label" className="block text-sm font-medium">Choose a date</span>
        <button
          type="button"
          disabled={!now}
          aria-labelledby="date-picker-label selected-date-label"
          aria-expanded={calendarOpen}
          aria-controls="deals-calendar"
          onClick={() => { setCalendarMonth(selectedDate.slice(0, 7)); setCalendarOpen(!calendarOpen); }}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-base"
          style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
        >
          <span id="selected-date-label">{dateLabel || "Loading date..."}</span>
          <span aria-hidden="true" className="text-xs">Calendar</span>
        </button>
        {calendarOpen && (
          <div id="deals-calendar" role="group" aria-label="Choose a deals date"
            onKeyDown={(event) => { if (event.key === "Escape") closeCalendar(); }}
            className="rounded-2xl border p-3 shadow-lg"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <div className="mb-2 flex items-center justify-between">
              <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} className="min-h-11 min-w-11 rounded-lg text-xl">&lsaquo;</button>
              <span className="font-semibold" aria-live="polite">{monthLabel}</span>
              <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} className="min-h-11 min-w-11 rounded-lg text-xl">&rsaquo;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="py-1 text-xs" aria-hidden="true">{day}</span>)}
              {Array.from({ length: monthOffset }, (_, index) => <span key={`blank-${index}`} />)}
              {Array.from({ length: monthDays }, (_, index) => {
                const day = index + 1;
                const date = `${visibleMonth}-${String(day).padStart(2, "0")}`;
                return (
                  <button key={date} type="button" aria-label={`${monthLabel} ${day}`}
                    aria-pressed={date === selectedDate} aria-current={date === today ? "date" : undefined}
                    onClick={() => { setChosenDate(date); closeCalendar(); }}
                    className="min-h-11 rounded-lg text-sm font-medium"
                    style={{ background: date === selectedDate ? "var(--accent)" : "var(--muted-bg)", color: date === selectedDate ? "var(--on-accent)" : "var(--foreground)" }}
                  >{day}</button>
                );
              })}
            </div>
          </div>
        )}
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
              onClick={() => { setChosenDate(label === "Today" ? null : date); setCalendarOpen(false); }}
              className="min-h-11 rounded-full px-4 py-2 text-sm font-medium"
              style={{
                background: selectedDate === date ? "var(--accent)" : "var(--muted-bg)",
                color: selectedDate === date ? "var(--on-accent)" : "var(--foreground)",
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
                  {now && selectedDate === today && isActiveDeal(deal, now) && (
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
