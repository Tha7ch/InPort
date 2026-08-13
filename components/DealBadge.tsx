import type { Deal } from "@/types";

export default function DealBadge({ deal }: { deal: Deal }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: "var(--deal-bg)", color: "var(--deal)" }}
    >
      🏷 {deal.description}
      {deal.type === "happy-hour" && deal.time_start && deal.time_end && (
        <span style={{ color: "var(--muted)" }}> ({deal.time_start}–{deal.time_end})</span>
      )}
    </span>
  );
}
