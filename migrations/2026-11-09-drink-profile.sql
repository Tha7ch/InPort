-- Additive schema change plus the already-displayed, source-backed Poynt profile.
-- Prepare only: execute explicitly before saving structured drink prices.
BEGIN;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS drink_profile JSONB;

-- Existing profiles and explicit JSON null (a user-cleared profile) are preserved.
UPDATE restaurants
SET drink_profile = '{
  "beer": { "min": 5, "max": 8 },
  "wine": { "min": 13, "max": 19 },
  "cocktails": { "min": 15, "max": 15 },
  "sourceUrl": "https://poyntnewburyport.com/menus",
  "checkedAt": "2026-11-08",
  "coverage": "Beer: cans and bottles; drafts unpriced. Wine: by the glass; market-price Sancerre excluded."
}'::jsonb
WHERE id = '166c62ff-a404-42f6-bb9c-3cbdd3b5ad71'
  AND lower(trim(name)) = 'the poynt'
  AND drink_profile IS NULL;
COMMIT;
