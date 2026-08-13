"use client";

import Link from "next/link";
import RestaurantForm from "@/components/RestaurantForm";

export default function NewRestaurantPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-xl" style={{ color: "var(--muted)" }}>
          ←
        </Link>
        <h1 className="text-2xl font-bold">Add Restaurant</h1>
      </div>
      <RestaurantForm />
    </div>
  );
}
