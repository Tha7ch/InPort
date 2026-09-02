"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Restaurant, Deal, OperatingHours, DayHours } from "@/types";

interface Props {
  restaurant?: Restaurant;
  existingDeals?: Deal[];
}

const CUISINE_OPTIONS = [
  "American", "Asian Fusion", "BBQ", "Brazilian", "Breakfast", "Chinese",
  "French", "Greek", "Indian", "Italian", "Japanese", "Korean",
  "Mediterranean", "Mexican", "Middle Eastern", "Pizza", "Seafood",
  "Sushi", "Thai", "Vietnamese", "Other",
];

const VIBE_OPTIONS = ["casual", "date-night", "fast", "family", "late-night", "outdoor", "sports-bar", "upscale"];
const DAY_OPTIONS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function RestaurantForm({ restaurant, existingDeals = [] }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(restaurant?.name ?? "");
  const [cuisines, setCuisines] = useState<string[]>(restaurant?.cuisine ?? []);
  const [priceTier, setPriceTier] = useState(restaurant?.price_tier ?? 2);
  const [supportsDineIn, setSupportsDineIn] = useState(restaurant?.supports_dine_in ?? true);
  const [supportsTakeout, setSupportsTakeout] = useState(restaurant?.supports_takeout ?? false);
  const [supportsDelivery, setSupportsDelivery] = useState(restaurant?.supports_delivery ?? false);
  const [deliveryPlatform, setDeliveryPlatform] = useState(restaurant?.delivery_platform ?? "");
  const [vibeTags, setVibeTags] = useState<string[]>(restaurant?.vibe_tags ?? []);
  const [favoriteDishes, setFavoriteDishes] = useState(restaurant?.favorite_dishes?.join(", ") ?? "");
  const [notes, setNotes] = useState(restaurant?.notes ?? "");
  const [address, setAddress] = useState(restaurant?.address ?? "");
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(
    restaurant?.operating_hours ?? {}
  );

  function setDayHours(day: keyof OperatingHours, hours: DayHours | null) {
    setOperatingHours((prev) => ({ ...prev, [day]: hours }));
  }

  const [deals, setDeals] = useState<Omit<Deal, "id" | "restaurant_id">[]>(
    existingDeals.map((d) => ({
      description: d.description,
      type: d.type,
      days: d.days,
      time_start: d.time_start,
      time_end: d.time_end,
      platform: d.platform,
    }))
  );
  const [dealsToDelete, setDealsToDelete] = useState<string[]>([]);

  function addDeal() {
    setDeals((prev) => [...prev, { description: "", type: "recurring", days: [], time_start: null, time_end: null, platform: "all" }]);
  }

  function updateDeal(index: number, field: string, value: unknown) {
    setDeals((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  function removeDeal(index: number) {
    if (existingDeals[index]) {
      setDealsToDelete((prev) => [...prev, existingDeals[index].id]);
    }
    setDeals((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleDay(index: number, day: string) {
    const deal = deals[index];
    const newDays = deal.days.includes(day)
      ? deal.days.filter((d) => d !== day)
      : [...deal.days, day];
    updateDeal(index, "days", newDays);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      name,
      cuisine: cuisines,
      price_tier: priceTier,
      supports_dine_in: supportsDineIn,
      supports_takeout: supportsTakeout,
      supports_delivery: supportsDelivery,
      delivery_platform: deliveryPlatform || null,
      vibe_tags: vibeTags,
      favorite_dishes: favoriteDishes.split(",").map((d) => d.trim()).filter(Boolean),
      notes: notes || null,
      address: address || null,
      google_place_id: restaurant?.google_place_id ?? null,
      operating_hours: Object.keys(operatingHours).length > 0 ? operatingHours : null,
    };

    let restaurantId = restaurant?.id;

    if (restaurant) {
      await fetch(`/api/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      restaurantId = created.id;
    }

    for (const dealId of dealsToDelete) {
      await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
    }

    if (restaurant) {
      for (const deal of existingDeals) {
        if (!dealsToDelete.includes(deal.id)) {
          await fetch(`/api/deals/${deal.id}`, { method: "DELETE" });
        }
      }
    }

    for (const deal of deals) {
      if (deal.description) {
        await fetch(`/api/restaurants/${restaurantId}/deals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(deal),
        });
      }
    }

    router.push("/admin");
    router.refresh();
  }

  const inputStyle = { background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Cuisine *</label>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() =>
                setCuisines((prev) =>
                  prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                )
              }
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: cuisines.includes(c) ? "var(--accent)" : "var(--muted-bg)",
                color: cuisines.includes(c) ? "white" : "var(--foreground)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Price tier</label>
        <div className="flex gap-2">
          {[1, 2, 3].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setPriceTier(tier)}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{
                background: priceTier === tier ? "var(--accent)" : "var(--muted-bg)",
                color: priceTier === tier ? "white" : "var(--foreground)",
              }}
            >
              {"$".repeat(tier)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Available for</label>
        <div className="flex gap-2">
          {[
            { key: "dine-in", label: "Dine-in", value: supportsDineIn, set: setSupportsDineIn },
            { key: "takeout", label: "Takeout", value: supportsTakeout, set: setSupportsTakeout },
            { key: "delivery", label: "Delivery", value: supportsDelivery, set: setSupportsDelivery },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => opt.set(!opt.value)}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{
                background: opt.value ? "var(--accent)" : "var(--muted-bg)",
                color: opt.value ? "white" : "var(--foreground)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {supportsDelivery && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">Delivery platform</label>
          <input
            type="text"
            value={deliveryPlatform}
            onChange={(e) => setDeliveryPlatform(e.target.value)}
            placeholder="DoorDash, UberEats, etc."
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium">Vibes</label>
        <div className="flex flex-wrap gap-2">
          {VIBE_OPTIONS.map((vibe) => (
            <button
              key={vibe}
              type="button"
              onClick={() =>
                setVibeTags((prev) =>
                  prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
                )
              }
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: vibeTags.includes(vibe) ? "var(--accent)" : "var(--muted-bg)",
                color: vibeTags.includes(vibe) ? "white" : "var(--foreground)",
              }}
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Favorite dishes</label>
        <input
          type="text"
          value={favoriteDishes}
          onChange={(e) => setFavoriteDishes(e.target.value)}
          placeholder="Pad thai, green curry, spring rolls"
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>Comma-separated</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 State St, Newburyport, MA"
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Operating Hours</label>
        <div className="space-y-2">
          {DAY_OPTIONS.map((day) => {
            const dayKey = day as keyof OperatingHours;
            const hours = operatingHours[dayKey];
            const isOpen = hours !== null && hours !== undefined;
            return (
              <div key={day} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDayHours(dayKey, isOpen ? null : { open: "11:00", close: "21:00" })}
                  className="w-12 rounded-lg py-1.5 text-[10px] font-medium transition-colors"
                  style={{
                    background: isOpen ? "var(--accent)" : "var(--muted-bg)",
                    color: isOpen ? "white" : "var(--foreground)",
                  }}
                >
                  {day.slice(0, 3).toUpperCase()}
                </button>
                {isOpen && hours ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => setDayHours(dayKey, { ...hours, open: e.target.value })}
                      className="rounded-lg border px-2 py-1.5 text-xs outline-none"
                      style={inputStyle}
                    />
                    <span className="text-xs" style={{ color: "var(--muted)" }}>to</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => setDayHours(dayKey, { ...hours, close: e.target.value })}
                      className="rounded-lg border px-2 py-1.5 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Cash only, great patio, etc."
          rows={2}
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none resize-none"
          style={inputStyle}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium">Deals & Specials</label>
          <button
            type="button"
            onClick={addDeal}
            className="rounded-lg px-3 py-1 text-xs font-medium"
            style={{ background: "var(--deal-bg)", color: "var(--deal)" }}
          >
            + Add deal
          </button>
        </div>

        <div className="space-y-4">
          {deals.map((deal, index) => (
            <div
              key={index}
              className="rounded-xl p-4 space-y-3"
              style={{ background: "var(--muted-bg)" }}
            >
              <div className="flex items-start justify-between">
                <input
                  type="text"
                  value={deal.description}
                  onChange={(e) => updateDeal(index, "description", e.target.value)}
                  placeholder="$1 tacos, half-price wings, etc."
                  className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => removeDeal(index)}
                  className="ml-2 rounded-lg px-2 py-2 text-xs text-red-500"
                  style={{ background: "var(--card)" }}
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={deal.type}
                  onChange={(e) => updateDeal(index, "type", e.target.value)}
                  className="rounded-lg border px-3 py-2 text-xs outline-none"
                  style={inputStyle}
                >
                  <option value="recurring">Recurring</option>
                  <option value="happy-hour">Happy Hour</option>
                </select>
                <select
                  value={deal.platform}
                  onChange={(e) => updateDeal(index, "platform", e.target.value)}
                  className="rounded-lg border px-3 py-2 text-xs outline-none"
                  style={inputStyle}
                >
                  <option value="all">All</option>
                  <option value="dine-in">Dine-in</option>
                  <option value="doordash">DoorDash</option>
                  <option value="ubereats">UberEats</option>
                </select>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium" style={{ color: "var(--muted)" }}>Days</p>
                <div className="flex flex-wrap gap-1.5">
                  {DAY_OPTIONS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index, day)}
                      className="rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors"
                      style={{
                        background: deal.days.includes(day) ? "var(--accent)" : "var(--card)",
                        color: deal.days.includes(day) ? "white" : "var(--foreground)",
                      }}
                    >
                      {day.slice(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {deal.type === "happy-hour" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs" style={{ color: "var(--muted)" }}>Start</label>
                    <input
                      type="time"
                      value={deal.time_start ?? ""}
                      onChange={(e) => updateDeal(index, "time_start", e.target.value || null)}
                      className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs" style={{ color: "var(--muted)" }}>End</label>
                    <input
                      type="time"
                      value={deal.time_end ?? ""}
                      onChange={(e) => updateDeal(index, "time_end", e.target.value || null)}
                      className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !name || cuisines.length === 0}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ background: "var(--accent)" }}
      >
        {saving ? "Saving..." : restaurant ? "Save changes" : "Add restaurant"}
      </button>
    </form>
  );
}
