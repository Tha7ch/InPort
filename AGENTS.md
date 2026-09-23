<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# InPort operating contract

InPort is a public, mobile-first restaurant recommendation PWA for Newburyport. It uses Next.js App Router, Neon Postgres, Anthropic's API, Vercel, and Tailwind CSS.

## Verification

- Type-check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Production build: `npm run build`

The project currently has no automated application test suite. Do not claim behavioral verification from type-check/build alone.

## Data, credentials, and external actions

Secrets belong only in `.env.local` or the deployment provider: `DATABASE_URL`, `ANTHROPIC_API_KEY`, and `INPORT_PIN`. Never commit or print credentials, environment files, production database content, user history, logs, exports, or generated builds. Keep `.env.local.example` placeholder-only.

`POST /api/init`, seed endpoints, database writes, deployments, publications, and production credential use are consequential external actions; require Trace's explicit request before invoking them.

## Git and deployment policy

InPort is an intentional public repository exception. Preserve `Tha7ch/InPort`, its public visibility, `main` branch, and existing Vercel deployment workflow. Do not create a replacement remote or change visibility. Before pushing, run all supported checks, inspect staged paths/diffs, scan for secrets and personal data, and verify local/remote parity.

Never reset, discard, overwrite, or include unrelated working changes.

## Model routing

Use lightweight models for bounded discovery, formatting, and mechanical edits. Use stronger reasoning for architecture, authentication, database/schema changes, credential handling, deployment risk, ambiguity, hard debugging, and final review.

Read `CLAUDE.md` for the preserved app architecture, environment variables, directory layout, and local-use patterns.
