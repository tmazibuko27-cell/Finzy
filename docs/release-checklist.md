# Release checklist

Tracks the acceptance checklist from the product spec plus what's actually done vs. still needed for this specific build.

## Done in this build

- [x] Expo + TypeScript + Expo Router app, strict mode, typechecks and lints clean.
- [x] Full IA: For You / Discover / Quiz / Saved / Profile tabs; person/company/topic/card detail routes; settings; onboarding; auth (email + Apple Sign In); paywall.
- [x] Vertically paged feed, all 8 MVP card types render, quiz-in-feed with locked answer → explanation → XP flow.
- [x] Local mock data layer so the whole app runs with zero backend setup.
- [x] Supabase schema (`0001_init.sql`) with RLS on every user-data table — tested end-to-end against a local Postgres instance with an `auth` schema shim.
- [x] Server-authoritative `get_feed`, `submit_quiz_answer` (idempotent, XP/streak/mastery/level), `request_account_deletion` RPCs — tested with real SQL execution, not just read.
- [x] `delete-account` and `revenuecat-webhook` Edge Functions (untested against a live project — no Supabase project exists yet).
- [x] Finzy Pro paywall wired to RevenueCat, entitlement gating in Settings/Profile, App Review–required elements on the paywall (price, auto-renew disclosure, restore, Terms/Privacy links).
- [x] `eas.json` build profiles (development/preview/production) and `app.json` iOS config (bundle id placeholder, Apple Sign In capability, notification permission string, encryption export compliance flag).
- [x] Synthetic seed data (`supabase/seed.sql`) mirroring the mock content, clearly marked as non-editorial placeholder.

## Blocked on you (I don't have access to do these)

- [ ] Create a Supabase project, run `supabase link` + `supabase db push`, fill in `.env.local`.
- [ ] Create a paid Apple Developer Program account ($99/yr).
- [ ] `eas login` on this machine; fill in real values in `eas.json`'s `submit.production.ios`.
- [ ] Create a RevenueCat project + App Store Connect subscription product; fill in `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` and `REVENUECAT_WEBHOOK_SECRET`.
- [ ] Host Privacy Policy / Terms / Educational Disclaimer pages publicly; replace the `example.com` placeholder URLs in `app/paywall.tsx` and `app/settings.tsx`.
- [ ] Real app icon, splash, and App Store screenshots (currently using Expo's default placeholder icon).
- [ ] Replace `com.finzy.app` bundle identifier if you want a different one (must be registered to your Apple Team).

## Still to build (not started)

- [ ] Real editorial content pipeline / admin workflow (spec targets 250–400 cards, 150–250 questions across 25+ topics — currently ~4 seeded demo cards).
- [ ] Push notification scheduling (daily reminder, streak-at-risk) — `expo-notifications` is installed and onboarding requests permission, but no scheduling logic exists yet.
- [ ] Analytics/crash reporting provider integration (spec calls for both; none wired up yet).
- [ ] Full accessibility pass (VoiceOver labels exist on most interactive elements via `accessibilityRole`/`accessibilityLabel`, but no device testing has been done — no simulator/device was available in this environment).
- [ ] Offline queue for writes (bookmarks/quiz answers currently require connectivity when Supabase is configured; local mock mode has no persistence conflict since there's nothing to sync).

## Before you submit to App Review

- [ ] Run the scripted 20-minute TestFlight test: onboarding → feed → quiz → save → search → profile → logout/login, on a real device.
- [ ] Verify RLS with two real user accounts (one user cannot read/write another's bookmarks, answers, XP ledger).
- [ ] Confirm no secrets are in the repo or client bundle: `grep -r "SERVICE_ROLE" app/ components/ features/ lib/` should return nothing.
- [ ] App Store Connect: age rating questionnaire, App Privacy disclosures (this app collects account email, usage analytics if you add a provider, and purchase history — declare accurately), review notes/demo credentials if needed.
