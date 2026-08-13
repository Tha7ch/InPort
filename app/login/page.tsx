"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid PIN");
      setPin("");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold" style={{ color: "var(--accent)" }}>InPort</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Newburyport dining, simplified
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            autoFocus
            className="w-full rounded-xl border px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none transition-colors focus:border-[var(--accent)]"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          />

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
