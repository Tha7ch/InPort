"use client";

import { useState, useEffect } from "react";
import type { HistoryEntry } from "@/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<(HistoryEntry & { restaurant_name: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Where you&apos;ve been eating</p>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No history yet</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Lock in a recommendation to start tracking</p>
        </div>
      )}

      <div className="space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-4 rounded-xl px-4 py-3"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="flex-1">
              <p className="font-semibold">{entry.restaurant_name}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {entry.meal_type}
                {entry.notes && ` · ${entry.notes}`}
              </p>
            </div>
            <p className="text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>
              {formatDate(entry.date)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
