# Finzy

Finance worth scrolling — a fast, personalized, dopamine-aware learning feed. iOS-first MVP built with React Native + Expo + TypeScript, Expo Router, and Supabase.

## Status

The app currently provides a local demo with a swipeable feed, practice quizzes, search, save/follow, onboarding, and optional Finzy Pro screens. Supabase migrations and selected live APIs exist, but several screens still use local data: connecting credentials alone does not complete the MVP.

See [the MVP comparison and continuation notes](docs/mvp-audit.md) for implemented features, known gaps, and the remaining build order.

## Get started

Requires Node `^20.19.4 || ^22.13.0 || ^24.3.0` (this repo is developed on 22.23.2 — see `.nvmrc`). If a terminal's `node -v` shows 16.x or 18.x, run `nvm use` in this directory first.

```bash
nvm use
npm install
npx expo start
```

Scan the QR code with Expo Go on a physical iPhone, or run in a simulator (requires full Xcode, not just Command Line Tools). Note: `react-native-purchases` is a native module not available in Expo Go — screens that touch it (paywall, Pro gating) will only fully work in a custom dev client / EAS build, though the rest of the app runs fine in Expo Go.

## Connecting a real backend

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.
3. Link and push the schema:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
4. Optionally load synthetic demo content: run `supabase/seed.sql` against your project (e.g. via the SQL editor, or `psql "$DATABASE_URL" -f supabase/seed.sql`). Replace with real, source-reviewed content before launch.
5. Deploy the Edge Functions:
   ```bash
   supabase functions deploy delete-account
   supabase functions deploy revenuecat-webhook
   supabase secrets set REVENUECAT_WEBHOOK_SECRET=<a-random-secret>
   ```

The Supabase CLI (`supabase`) is already installed on this machine at `~/.local/bin/supabase` — installed as a prebuilt binary rather than via Homebrew, because this Mac is on macOS 14 ("Tier 3" for Homebrew, no bottles), which meant `brew install supabase` was pulling in a from-source compile of `bun` as a transitive dependency. If you ever want to reinstall via Homebrew instead, expect that same slow compile.

Local Supabase (`supabase start`) needs Docker Desktop, which isn't installed on this machine. The schema and RPC functions were instead validated end-to-end against a local throwaway Postgres 14 instance (already installed here) with a minimal `auth` schema shim — see the migration files' structure for what was verified: RLS policies, `get_feed` ranking, `submit_quiz_answer` idempotency/XP/streak/mastery, and the level curve. Real testing against Supabase's actual `auth` schema still needs a real project.

## Enabling Finzy Pro (monetization)

Finzy Pro is a single subscription that unlocks quality-of-life perks (unlimited streak freezes, full mastery insights, a profile badge) — **all core learning content stays free**. This was a deliberate scope decision (the original product spec listed paywalls as out-of-scope for V1.0; see `docs/decisions.md`).

1. Create a project at [revenuecat.com](https://www.revenuecat.com) and connect it to an App Store Connect subscription group (needs a paid Apple Developer account first — see below).
2. Put the RevenueCat iOS public SDK key in `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`.
3. Point a RevenueCat webhook at the deployed `revenuecat-webhook` Edge Function, with `Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>`.
4. Without any of this configured, `isPurchasesConfigured` is `false` and the paywall screen shows a friendly "not available yet" message instead of crashing — the app is always runnable either way.

## What you still need to do yourself (I can't do these for you)

- **Apple Developer Program account** ($99/yr) — required for TestFlight/App Store submission and to create real subscription products.
- **`eas login`** on this machine, then update `eas.json`'s `submit.production.ios` block with your real Apple ID email, App Store Connect app ID, and Apple Team ID.
- **Host the Privacy Policy / Terms / Disclaimer pages** somewhere public (a simple static site, Notion page, or GitHub Pages) and swap the `https://example.com/finzy/...` placeholder URLs in `app/paywall.tsx` and `app/settings.tsx`.
- **Real app icon and screenshots** for the App Store listing.
- **Replace all synthetic seed content** (`lib/mockFeed.ts`, `lib/mockEntities.ts`, `supabase/seed.sql`) with source-reviewed editorial content — target from the spec is 250–400 cards / 150–250 questions across 25+ topics before a real launch.

See `docs/release-checklist.md` for the full pre-submission checklist.

## Project structure

```
app/            Expo Router routes (file-based navigation)
components/     Shared UI (feed cards, quiz, theme, empty/error states)
features/       Feature-scoped logic (auth, feed, quiz, pro, discover, onboarding)
lib/            Cross-cutting: env validation, Supabase client, theme, purchases, local store
types/          Shared TypeScript types
supabase/       migrations/, functions/ (Edge Functions), seed.sql
docs/           decisions.md, release-checklist.md
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Metro dev server |
| `npm run ios` / `android` / `web` | Start on a specific platform |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build:preview` / `build:production` | EAS builds (needs `eas login`) |
| `npm run submit:production` | EAS submit to App Store Connect |
