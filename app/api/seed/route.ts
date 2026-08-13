import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const RESTAURANTS = [
  {
    name: "Smoke on The Water",
    cuisine: ["BBQ", "American"],
    price_tier: 2,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: false,
    vibe_tags: ["casual", "outdoor"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "Morning Buzz Cafe",
    cuisine: ["American"],
    price_tier: 1,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: false,
    vibe_tags: ["casual", "fast"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "Park Lunch",
    cuisine: ["American"],
    price_tier: 1,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: false,
    vibe_tags: ["casual", "fast"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "Nick's Pizza",
    cuisine: ["Pizza", "Italian"],
    price_tier: 1,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: true,
    delivery_platform: "DoorDash",
    vibe_tags: ["casual", "family"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "Michael's Harborside",
    cuisine: ["Seafood", "American"],
    price_tier: 3,
    supports_dine_in: true,
    supports_takeout: false,
    supports_delivery: false,
    vibe_tags: ["date-night", "outdoor", "upscale"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "The Goat",
    cuisine: ["American"],
    price_tier: 2,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: false,
    vibe_tags: ["casual", "sports-bar"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "Tuscan Sea Grill & Bar",
    cuisine: ["Italian", "Seafood"],
    price_tier: 3,
    supports_dine_in: true,
    supports_takeout: false,
    supports_delivery: false,
    vibe_tags: ["date-night", "upscale"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "Angie's Food and Diner",
    cuisine: ["American"],
    price_tier: 1,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: false,
    vibe_tags: ["casual", "fast", "family"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "Stone Crust Pizza",
    cuisine: ["Pizza"],
    price_tier: 2,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: true,
    vibe_tags: ["casual", "family"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "Anchor Stone Deck Pizza",
    cuisine: ["Pizza"],
    price_tier: 2,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: false,
    vibe_tags: ["casual", "outdoor"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "The Paddle Inn",
    cuisine: ["American", "Seafood"],
    price_tier: 2,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: false,
    vibe_tags: ["casual", "outdoor", "sports-bar"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "The Grog",
    cuisine: ["American"],
    price_tier: 2,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: false,
    vibe_tags: ["casual", "late-night", "sports-bar"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
  {
    name: "Port Vida",
    cuisine: ["Mexican"],
    price_tier: 2,
    supports_dine_in: true,
    supports_takeout: true,
    supports_delivery: false,
    vibe_tags: ["casual", "date-night"],
    favorite_dishes: [],
    address: "Newburyport, MA",
  },
];

export async function POST() {
  const sql = neon(process.env.DATABASE_URL!);

  const results = [];
  for (const r of RESTAURANTS) {
    const existing = await sql`SELECT id FROM restaurants WHERE name = ${r.name}`;
    if (existing.length > 0) {
      results.push({ name: r.name, status: "skipped (already exists)" });
      continue;
    }

    await sql`
      INSERT INTO restaurants (name, cuisine, price_tier, supports_dine_in, supports_takeout, supports_delivery, delivery_platform, vibe_tags, favorite_dishes, address)
      VALUES (${r.name}, ${r.cuisine}, ${r.price_tier}, ${r.supports_dine_in}, ${r.supports_takeout}, ${r.supports_delivery}, ${(r as Record<string, unknown>).delivery_platform as string ?? null}, ${r.vibe_tags}, ${r.favorite_dishes}, ${r.address})
    `;
    results.push({ name: r.name, status: "created" });
  }

  return NextResponse.json({ success: true, results });
}
