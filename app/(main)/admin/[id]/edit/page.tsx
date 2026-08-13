"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import RestaurantForm from "@/components/RestaurantForm";
import type { Restaurant, Deal } from "@/types";

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/restaurants/${id}`).then((r) => r.json()),
      fetch(`/api/restaurants/${id}/deals`).then((r) => r.json()),
    ]).then(([r, d]) => {
      setRestaurant(r);
      setDeals(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <p className="text-sm text-red-500">Restaurant not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-xl" style={{ color: "var(--muted)" }}>
          ←
        </Link>
        <h1 className="text-2xl font-bold">Edit {restaurant.name}</h1>
      </div>
      <RestaurantForm restaurant={restaurant} existingDeals={deals} />
    </div>
  );
}
