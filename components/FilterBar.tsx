"use client";

interface Filters {
  cuisine: string;
  mode: string;
  dealsOnly: boolean;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  cuisines: string[];
}

const MODES = [
  { value: "", label: "Any" },
  { value: "dine-in", label: "Dine-in" },
  { value: "takeout", label: "Takeout" },
  { value: "delivery", label: "Delivery" },
];

export default function FilterBar({ filters, onChange, cuisines }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onChange({ ...filters, mode: mode.value })}
            className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: filters.mode === mode.value ? "var(--accent)" : "var(--muted-bg)",
              color: filters.mode === mode.value ? "white" : "var(--foreground)",
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <select
          value={filters.cuisine}
          onChange={(e) => onChange({ ...filters, cuisine: e.target.value })}
          className="flex-1 rounded-xl border px-3 py-2.5 text-sm"
          style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
        >
          <option value="">All cuisines</option>
          {cuisines.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={() => onChange({ ...filters, dealsOnly: !filters.dealsOnly })}
          className="whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          style={{
            background: filters.dealsOnly ? "var(--deal-bg)" : "var(--muted-bg)",
            color: filters.dealsOnly ? "var(--deal)" : "var(--foreground)",
            border: filters.dealsOnly ? "1px solid var(--deal)" : "1px solid transparent",
          }}
        >
          🏷 Deals only
        </button>
      </div>
    </div>
  );
}
