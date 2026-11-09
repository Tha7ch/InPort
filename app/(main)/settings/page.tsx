import Link from "next/link";

export default function SettingsPage() {
  return <div className="mx-auto max-w-lg px-4 pt-6"><h1 className="text-3xl font-bold" style={{ color: "var(--accent)" }}>Settings</h1><p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Your places and past picks.</p><div className="mt-6 space-y-3">{[{ href: "/admin", title: "Manage places", description: "Add places and edit menus, prices, hours, and deals." }, { href: "/history", title: "Dining history", description: "Look back at the places you picked." }].map((item) => <Link key={item.href} href={item.href} className="block rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}><h2 className="font-semibold">{item.title} <span aria-hidden="true">→</span></h2><p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{item.description}</p></Link>)}</div></div>;
}
