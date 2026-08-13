CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recurring', 'happy-hour')),
  days TEXT[] DEFAULT '{}',
  time_start TIME,
  time_end TIME,
  platform TEXT NOT NULL DEFAULT 'all'
);

CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL DEFAULT 'dine-in',
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_deals_restaurant ON deals(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_history_restaurant ON history(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON history(date DESC);
