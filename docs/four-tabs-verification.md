# Four-tab verification — 2026-11-09

Implemented Food / Drinks / Deals / Settings. Food retains Surprise me and shows a searchable directory. Drinks ranks known-open venues first, then bar picks within each availability group; shows three sourced price categories. Cards show venue closing status, final-hour notice, next known opening or unknown hours. Bar-service hours remain unverified. Settings preserves management/history routes.

Validation: 17 Node tests passed; TypeScript, ESLint, production build passed. Independent review found clear-profile fallback and inconsistent deal LIVE status; both fixed. Synthetic local browser checks confirmed visible initial cards, search narrowing, recommendation503 leaves directory usable, open Goat above open bistro and closed Whale below unknown Poynt, sourced Poynt prices, Settings selected on history, and Tomorrow on an empty Deals day. No production writes or AI calls used for verification.

Run tests (Node26): `node --import ./tests/register-types.mjs --experimental-strip-types --test tests/*.test.mjs`.

Deployment prerequisite for editing drink prices: explicitly approved execution of `migrations/2026-11-09-drink-profile.sql`. This additive transaction adds JSONB and seeds only the known Poynt row when no profile exists; preserves existing/cleared profiles. Readers and unchanged restaurant edits work before migration. Public push triggers existing Vercel integration. API key renewal remains separate and unverified.
