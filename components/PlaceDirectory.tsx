"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RestaurantWithDeals } from "@/types";
import { getVenueStatus } from "@/lib/venue";
import { getDrinkProfile } from "@/lib/drinks";
import { isActiveDeal } from "@/lib/deals";

interface Props {
  restaurants: RestaurantWithDeals[];
  mode: "food" | "drinks";
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  filters?: { cuisine: string; mode: string; dealsOnly: boolean };
}

function barPriority(restaurant: RestaurantWithDeals) {
  return /\b(goat|thirsty whale)\b/i.test(restaurant.name) || restaurant.vibe_tags.some((tag) => /\b(bar|pub|tavern)\b/i.test(tag));
}

function formatRange(range?: { min: number; max: number }) {
  if (!range) return "Not verified";
  return range.min === range.max ? `$${range.min}` : `$${range.min}–${range.max}`;
}

export default function PlaceDirectory({ restaurants, mode, loading, error, onRetry, filters }: Props) {
  const [query, setQuery] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const listed = restaurants.map((restaurant) => ({
    restaurant,
    status: now ? getVenueStatus(restaurant.operating_hours, now) : { state: "unknown" as const, label: "Checking hours…", closingSoon: false },
    activeDeals: now ? (restaurant.deals ?? []).filter((deal) => isActiveDeal(deal, now)) : [],
  })).filter(({ restaurant, activeDeals }) => {
    const searchText = [restaurant.name, ...restaurant.cuisine, ...restaurant.vibe_tags, restaurant.address ?? ""].join(" ").toLowerCase();
    if (!searchText.includes(query.trim().toLowerCase())) return false;
    if (filters?.cuisine && !restaurant.cuisine.includes(filters.cuisine)) return false;
    if (filters?.mode === "dine-in" && !restaurant.supports_dine_in) return false;
    if (filters?.mode === "takeout" && !restaurant.supports_takeout) return false;
    if (filters?.mode === "delivery" && !restaurant.supports_delivery) return false;
    return !filters?.dealsOnly || activeDeals.length > 0;
  }).sort((a, b) => {
    if (mode === "drinks") {
      const rank = { open: 0, unknown: 1, closed: 2 };
      const availability = rank[a.status.state] - rank[b.status.state];
      if (availability) return availability;
      const bars = Number(barPriority(b.restaurant)) - Number(barPriority(a.restaurant));
      if (bars) return bars;
      if (a.status.closingSoon !== b.status.closingSoon) return Number(a.status.closingSoon) - Number(b.status.closingSoon);
    }
    return a.restaurant.name.localeCompare(b.restaurant.name);
  });

  return (
    <section className="mt-8 pb-6" aria-labelledby={`${mode}-places-heading`}>
      <div className="mb-4">
        <h2 id={`${mode}-places-heading`} className="text-xl font-bold">{mode === "food" ? "Explore places" : "Find your next round"}</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{mode === "food" ? "Browse your local spots, or narrow the list below." : "Open venues first, with bars at the top of each group."}</p>
      </div>
      <label htmlFor={`${mode}-search`} className="sr-only">Search {mode === "food" ? "restaurants" : "bars and restaurants"}</label>
      <input id={`${mode}-search`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places, cuisines, or neighborhoods" className="mb-4 w-full rounded-xl border px-4 py-3 text-sm" style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }} />
      {loading && <p role="status" className="py-6 text-center text-sm" style={{ color: "var(--muted)" }}>Loading places…</p>}
      {error && <div role="alert" className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--card-border)", background: "var(--card)" }}><p>{error}</p><button onClick={onRetry} className="mt-3 font-semibold underline" style={{ color: "var(--accent)" }}>Try again</button></div>}
      {!loading && !error && <p aria-live="polite" className="mb-3 text-xs" style={{ color: "var(--muted)" }}>{listed.length} {listed.length === 1 ? "place" : "places"}{mode === "drinks" ? " · Hours shown in Newburyport time" : ""}</p>}
      {!loading && !error && listed.length === 0 && <p className="rounded-xl p-6 text-center text-sm" style={{ background: "var(--muted-bg)" }}>{restaurants.length ? "No places match. Try a different search or filter." : "No places added yet. Add your first place in Settings."}</p>}
      <div className="space-y-4">
        {listed.map(({ restaurant, status, activeDeals }) => {
          const drinks = getDrinkProfile(restaurant);
          return (
            <article key={restaurant.id} className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
              <h3 className="text-lg font-bold">{restaurant.name}</h3>
              <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{restaurant.cuisine.join(" · ")}{restaurant.price_tier > 0 && ` · ${"$".repeat(Math.min(restaurant.price_tier, 4))}`}{mode === "drinks" && barPriority(restaurant) && " · Bar pick"}</p>
              <div className="mt-3 rounded-lg px-3 py-2" style={{ background: status.state === "open" ? "var(--deal-bg)" : "var(--muted-bg)" }}>
                <p className="text-sm font-semibold" style={{ color: status.state === "open" ? "var(--deal)" : "var(--foreground)" }}>{mode === "drinks" && status.state !== "unknown" ? "Venue · " : ""}{status.label}</p>
                {status.closingSoon && <p className="mt-0.5 text-xs font-semibold">Closing soon · within an hour</p>}
                {mode === "drinks" && <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>Bar hours not verified</p>}
              </div>
              {mode === "drinks" && <>
                <dl className="mt-4 grid grid-cols-3 gap-2">
                  {([['Beer', drinks?.beer], ['Wine / glass', drinks?.wine], ['Cocktails', drinks?.cocktails]] as const).map(([label, range]) => <div key={label} className="rounded-lg p-2 text-center" style={{ background: "var(--muted-bg)" }}><dt className="text-xs" style={{ color: "var(--muted)" }}>{label}</dt><dd className={`mt-1 font-semibold ${range ? "text-base" : "text-xs"}`}>{formatRange(range)}</dd></div>)}
                </dl>
                {drinks && <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{drinks.coverage && <>{drinks.coverage} </>}<a href={drinks.sourceUrl} target="_blank" rel="noreferrer" className="underline">Menu source</a> · Checked {drinks.checkedAt}</p>}
              </>}
              {activeDeals.length > 0 && <Link href="/deals" className="mt-3 block rounded-lg px-3 py-2 text-sm" style={{ background: "var(--deal-bg)", color: "var(--deal)" }}><span className="font-semibold">Deal on now</span> · {activeDeals[0].description}{activeDeals.length > 1 && ` (+${activeDeals.length - 1} more)`}</Link>}
              {restaurant.address && <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>{restaurant.address}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

