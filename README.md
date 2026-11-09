# InPort

A public, mobile-first restaurant recommendation PWA for Newburyport, powered by Next.js, Neon Postgres, and Claude.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Verification and security

Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Secrets belong in `.env.local` or Vercel and must never be committed. Database initialization, seed endpoints, deployments, and production writes are intentional owner actions, not verification steps.

This is an intentional public repository. Preserve its existing GitHub visibility and Vercel workflow.

## Browse deals by date

The Deals page has a calendar date picker plus Today and Tomorrow shortcuts. It shows saved recurring offers for the selected weekday, including when today has no offers. Dates and live happy-hour badges use America/New_York time; LIVE appears only on today. Future dates reflect the saved weekly schedule, not verified availability or offer expiry.

Validated 2026-11-08: type-check, lint, production build, and seven date/time boundary assertions (New York midnight, year rollover, leap day, DST date arithmetic, happy-hour window/day).

Local synthetic-data browser check: empty Sunday, Tomorrow shows Monday offer, calendar opens and selecting Tuesday shows only Tuesday offer without LIVE. App-rendered calendar used for embedded-browser compatibility. Trace approved public GitHub publication and the existing Vercel deployment on 2026-11-08.
