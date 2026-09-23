@AGENTS.md

# InPort

Restaurant recommendation PWA for Newburyport, MA. Mobile-first, deal-aware, powered by Claude.

## Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Neon Postgres (via Vercel integration)
- **AI**: Claude API (Anthropic SDK)
- **Hosting**: Vercel (free tier)
- **Styling**: Tailwind CSS v4

## Environment Variables
- `DATABASE_URL` — Neon Postgres connection string
- `ANTHROPIC_API_KEY` — Claude API key
- `INPORT_PIN` — Simple PIN for authentication

## Directory Layout
- `app/(main)/` — authenticated pages with bottom nav (home, deals, history, admin)
- `app/login/` — PIN gate (no nav)
- `app/api/` — all API routes
- `components/` — shared React components
- `lib/` — db helpers, auth, deals logic, recommendation engine
- `types/` — TypeScript interfaces

## Key Patterns
- Route groups: `(main)` wraps all authenticated pages with Navigation component
- Auth via middleware — checks `inport_session` cookie, redirects to `/login`
- Database: Neon serverless driver, direct SQL via tagged template literals
- Deals matching: checks current day-of-week + time window against deal records
- Recommendations: builds a prompt with restaurant list, active deals, and recent history, sends to Claude

## Running Locally
Requires `DATABASE_URL`, `ANTHROPIC_API_KEY`, and `INPORT_PIN` in `.env.local`.
Hit `POST /api/init` once to create database tables.

```bash
npm run dev
```
