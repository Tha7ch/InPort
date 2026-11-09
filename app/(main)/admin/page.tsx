"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Restaurant } from "@/types";

export default function AdminPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    await fetch(`/api/restaurants/${id}`, { method: "DELETE" });
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          + Add
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search restaurants..."
        className="mb-4 w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
        style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
      />

      {loading && (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((restaurant) => (
          <div
            key={restaurant.id}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{restaurant.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                {restaurant.cuisine.join(", ")} · {"$".repeat(restaurant.price_tier)}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/${restaurant.id}/edit`}
                className="rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{ background: "var(--muted-bg)" }}
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(restaurant.id, restaurant.name)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500"
                style={{ background: "var(--muted-bg)" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <p className="text-4xl mb-3">🍽</p>
          <p className="font-medium">{search ? "No matches" : "No restaurants yet"}</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {search ? "Try a different search" : "Tap + Add to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
