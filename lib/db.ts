import { neon } from "@neondatabase/serverless";
import type { Restaurant, Deal, HistoryEntry, RestaurantWithDeals } from "@/types";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function getAllRestaurants(): Promise<Restaurant[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM restaurants ORDER BY name`;
  return rows as unknown as Restaurant[];
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM restaurants WHERE id = ${id}`;
  return (rows[0] as unknown as Restaurant) ?? null;
}

export async function getRestaurantsWithDeals(): Promise<RestaurantWithDeals[]> {
  const sql = getDb();
  const restaurants = await sql`SELECT * FROM restaurants ORDER BY name`;
  const deals = await sql`SELECT * FROM deals`;

  const dealsByRestaurant = new Map<string, Deal[]>();
  for (const deal of deals) {
    const d = deal as unknown as Deal;
    if (!dealsByRestaurant.has(d.restaurant_id)) {
      dealsByRestaurant.set(d.restaurant_id, []);
    }
    dealsByRestaurant.get(d.restaurant_id)!.push(d);
  }

  return (restaurants as unknown as Restaurant[]).map((r) => ({
    ...r,
    deals: dealsByRestaurant.get(r.id) || [],
  }));
}

export async function createRestaurant(data: Omit<Restaurant, "id" | "created_at" | "updated_at">): Promise<Restaurant> {
  const sql = getDb();
  const rows = data.drink_profile === undefined ? await sql`
    INSERT INTO restaurants (name, cuisine, price_tier, supports_dine_in, supports_takeout, supports_delivery, delivery_platform, vibe_tags, favorite_dishes, notes, address, google_place_id, operating_hours)
    VALUES (${data.name}, ${data.cuisine}, ${data.price_tier}, ${data.supports_dine_in}, ${data.supports_takeout}, ${data.supports_delivery}, ${data.delivery_platform}, ${data.vibe_tags}, ${data.favorite_dishes}, ${data.notes}, ${data.address}, ${data.google_place_id}, ${JSON.stringify(data.operating_hours)})
    RETURNING *
  ` : await sql`
    INSERT INTO restaurants (name, cuisine, price_tier, supports_dine_in, supports_takeout, supports_delivery, delivery_platform, vibe_tags, favorite_dishes, notes, address, google_place_id, operating_hours, drink_profile)
    VALUES (${data.name}, ${data.cuisine}, ${data.price_tier}, ${data.supports_dine_in}, ${data.supports_takeout}, ${data.supports_delivery}, ${data.delivery_platform}, ${data.vibe_tags}, ${data.favorite_dishes}, ${data.notes}, ${data.address}, ${data.google_place_id}, ${JSON.stringify(data.operating_hours)}, ${JSON.stringify(data.drink_profile)})
    RETURNING *
  `;
  return rows[0] as unknown as Restaurant;
}

export async function updateRestaurant(id: string, data: Partial<Omit<Restaurant, "id" | "created_at" | "updated_at">>): Promise<Restaurant | null> {
  const sql = getDb();
  const current = await getRestaurantById(id);
  if (!current) return null;

  const merged = { ...current, ...data, updated_at: new Date().toISOString() };
  const rows = data.drink_profile === undefined ? await sql`
    UPDATE restaurants SET
      name = ${merged.name},
      cuisine = ${merged.cuisine},
      price_tier = ${merged.price_tier},
      supports_dine_in = ${merged.supports_dine_in},
      supports_takeout = ${merged.supports_takeout},
      supports_delivery = ${merged.supports_delivery},
      delivery_platform = ${merged.delivery_platform},
      vibe_tags = ${merged.vibe_tags},
      favorite_dishes = ${merged.favorite_dishes},
      notes = ${merged.notes},
      address = ${merged.address},
      google_place_id = ${merged.google_place_id},
      operating_hours = ${JSON.stringify(merged.operating_hours)},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  ` : await sql`
    UPDATE restaurants SET
      name = ${merged.name},
      cuisine = ${merged.cuisine},
      price_tier = ${merged.price_tier},
      supports_dine_in = ${merged.supports_dine_in},
      supports_takeout = ${merged.supports_takeout},
      supports_delivery = ${merged.supports_delivery},
      delivery_platform = ${merged.delivery_platform},
      vibe_tags = ${merged.vibe_tags},
      favorite_dishes = ${merged.favorite_dishes},
      notes = ${merged.notes},
      address = ${merged.address},
      google_place_id = ${merged.google_place_id},
      operating_hours = ${JSON.stringify(merged.operating_hours)},
      drink_profile = ${JSON.stringify(data.drink_profile)},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as Restaurant) ?? null;
}

export async function deleteRestaurant(id: string): Promise<boolean> {
  const sql = getDb();
  const result = await sql`DELETE FROM restaurants WHERE id = ${id}`;
  return result.length > 0 || true;
}

export async function getDealsByRestaurant(restaurantId: string): Promise<Deal[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM deals WHERE restaurant_id = ${restaurantId}`;
  return rows as unknown as Deal[];
}

export async function createDeal(data: Omit<Deal, "id">): Promise<Deal> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO deals (restaurant_id, description, type, days, time_start, time_end, platform)
    VALUES (${data.restaurant_id}, ${data.description}, ${data.type}, ${data.days}, ${data.time_start}, ${data.time_end}, ${data.platform})
    RETURNING *
  `;
  return rows[0] as unknown as Deal;
}

export async function deleteDeal(id: string): Promise<boolean> {
  const sql = getDb();
  await sql`DELETE FROM deals WHERE id = ${id}`;
  return true;
}

export async function getHistory(limit = 20): Promise<(HistoryEntry & { restaurant_name: string })[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT h.*, r.name as restaurant_name
    FROM history h
    JOIN restaurants r ON r.id = h.restaurant_id
    ORDER BY h.date DESC
    LIMIT ${limit}
  `;
  return rows as unknown as (HistoryEntry & { restaurant_name: string })[];
}

export async function createHistoryEntry(data: { restaurant_id: string; meal_type: string; notes?: string }): Promise<HistoryEntry> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO history (restaurant_id, meal_type, notes)
    VALUES (${data.restaurant_id}, ${data.meal_type}, ${data.notes ?? null})
    RETURNING *
  `;
  return rows[0] as unknown as HistoryEntry;
}

export async function initializeDatabase(): Promise<void> {
  const sql = getDb();
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
  await sql`
    CREATE TABLE IF NOT EXISTS restaurants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      cuisine TEXT[] NOT NULL DEFAULT '{}',
      price_tier INTEGER NOT NULL DEFAULT 2,
      supports_dine_in BOOLEAN NOT NULL DEFAULT true,
      supports_takeout BOOLEAN NOT NULL DEFAULT false,
      supports_delivery BOOLEAN NOT NULL DEFAULT false,
      delivery_platform TEXT,
      vibe_tags TEXT[] DEFAULT '{}',
      favorite_dishes TEXT[] DEFAULT '{}',
      notes TEXT,
      address TEXT,
      google_place_id TEXT,
      operating_hours JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS operating_hours JSONB`;
  await sql`
    CREATE TABLE IF NOT EXISTS deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('recurring', 'happy-hour')),
      days TEXT[] DEFAULT '{}',
      time_start TIME,
      time_end TIME,
      platform TEXT NOT NULL DEFAULT 'all'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      meal_type TEXT NOT NULL DEFAULT 'dine-in',
      notes TEXT
    )
  `;
}
