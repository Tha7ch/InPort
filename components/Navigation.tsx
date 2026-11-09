"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Food", icon: "🍽" },
  { href: "/drinks", label: "Drinks", icon: "🍸" },
  { href: "/deals", label: "Deals", icon: "🏷" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t" style={{ background: "var(--card)", borderColor: "var(--card-border)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto flex max-w-lg">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/")) || (item.href === "/settings" && /^\/(admin|history)(\/|$)/.test(pathname));
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className="flex flex-1 flex-col items-center py-2 text-xs transition-colors" style={{ color: active ? "var(--accent)" : "var(--muted)" }}>
              <span aria-hidden="true" className="text-xl">{item.icon}</span>
              <span className="mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
