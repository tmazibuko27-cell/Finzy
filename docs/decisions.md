# Decisions log

## 2026-09-13 — Added a paywall (Finzy Pro), overriding the original spec

The original product spec (`Finzy_MVP_Product_and_Claude_Code_Build_Spec`) explicitly listed "paid subscription/paywall in the first release" as **out of scope** for V1.0. The user later asked, mid-build, to add a payment gate and a way to monetize before App Store submission.

**Decision:** Ship a single "Finzy Pro" subscription that unlocks quality-of-life perks only — unlimited streak freezes, full topic-by-topic mastery insights, and a profile badge. Core learning content (feed, quizzes, XP, streaks, search, entities) stays entirely free. This preserves the spec's "trust over hype" and "progress without punishment" principles while still monetizing.

**Why this model over a usage-capped freemium wall:** the user picked it directly (asked via clarifying question) over capping daily cards/quizzes, to avoid feed a paywall interrupting the core learning loop the whole spec is built around.

**Implementation:** RevenueCat (`react-native-purchases`) rather than raw StoreKit, since it handles receipt validation and cross-device entitlement sync with much less custom code. `lib/purchases.ts` follows the same "optional at boot" pattern as `lib/supabase.ts` — without an API key, the app runs fully and only Pro purchases are disabled. Entitlement truth is synced server-side via the `revenuecat-webhook` Edge Function onto `profiles.is_pro`, not trusted from the client.

## 2026-09-13 — Local demo/mock mode instead of blocking on a live Supabase project

No Supabase project existed yet when the build started. Rather than block all UI work on the user creating one, every data-access layer (`features/feed/api.ts`, `features/quiz/api.ts`, `features/auth/AuthProvider.tsx`) checks `isSupabaseConfigured` and falls back to local mock data (`lib/mockFeed.ts`, `lib/mockEntities.ts`). This keeps the "always runnable" rule from the spec's Claude Code operating instructions intact, and means connecting a real backend later is a config change, not a rewrite.

## 2026-09-13 — Node version and Homebrew tooling

The Mac's default Node was 16.20.2 (via nvm), too old for the current Expo SDK. Switched to the already-installed Node 20.16.0 (`nvm use 20.16.0`) for all tooling. Homebrew on this machine's macOS 14 is "Tier 3" (no bottles), so `brew install supabase` was compiling `bun` from source as a transitive dependency — killed that build and installed the Supabase CLI as a prebuilt binary from GitHub releases instead (`~/.local/bin/supabase`). `postgresql@14` had a broken `icu4c` link from an earlier interrupted brew operation; fixed via `brew reinstall icu4c@78 postgresql@14` (both had bottles, no source compiles).

## 2026-09-14 — Upgraded to Expo SDK 57 / Node 22, fixed the nvm default

The physical iPhone's Expo Go client only supports SDK 57 (the SDK 51 project scaffolded on day one couldn't load in it at all — a hard version-lock, not a network issue). Upgraded the whole project: `expo@57`, `react-native@0.86.3`, `react@19.2.3`, dropped the now-unnecessary direct `@react-navigation/native` dependency (expo-router stopped depending on it as of SDK 56 — theming imports move to `expo-router/react-navigation`), and fixed two new stricter `eslint-plugin-react-hooks` findings (ref/impure-value access during render in `PackRipper.tsx`/`CardSkeleton.tsx`).

SDK 57's tooling requires Node `^20.19.4 || ^22.13.0 || ^24.3.0`, so Node 20.16.0 no longer works — installed Node 22.23.2 via nvm and **changed the nvm default alias** (`nvm alias default 22.23.2`) plus added a project `.nvmrc`, since a stale default was exactly why a separate terminal session picked up Node 16.20.2 and failed to run lint. Any new terminal now gets a working Node version automatically; run `nvm use` inside the project directory to be certain.
