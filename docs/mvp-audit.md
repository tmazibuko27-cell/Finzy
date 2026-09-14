# Finzy MVP implementation audit — 2026-09-14

Baseline: the complete 20-page Finzy MVP Product and Claude Code Build Specification v1.0 supplied in Downloads. This is a code inspection, not certification of deployed services or device behavior. Existing uncommitted Claude work was preserved.

## Comparison

| Area | Existing implementation | Remaining MVP work |
| --- | --- | --- |
| Foundation | Expo 57, strict TypeScript, Router, theme, Supabase client, EAS profiles | Native device QA and signed release validation |
| Auth | Email/Apple screens, session provider, secure storage integration, deletion function | Password recovery, guest merge, error-path verification, account-scoped local data |
| Onboarding | Interests, experience and goals UI | Persist selected preferences to local/server profile; explicit optional notification choice |
| Feed | Paged cards, eight type definitions, get_feed SQL ranking | Dwell/completion events, authoritative card XP, viewport/safe-area QA, persistent offline cache, session restoration |
| Quizzes | Option-based quiz UI and server submission RPC | Numeric input, persistent pending submissions, mastery integration and full server security/idempotency tests |
| Daily Quiz | Two demo questions in local practice | Five distinct server-selected questions, interests/weak areas, daily bonus and saved completion |
| Progress | SQL XP/streak/mastery foundation | Profile currently displays fixed identity/level/streak and local XP; wire authoritative stats and achievements |
| Discover | Local search and entity routes | Database search, tickers/events, server-backed entity details and source lists |
| Saved/follows | Local persisted IDs and UI | Server writes, optimistic reconciliation, offline queue, account isolation |
| Reports/preferences | Action menu exists | Report callbacks and not-interested actions are no-ops; persist and apply filtering |
| Settings | Account actions, legal links and switches | Placeholder legal/support destinations, notification scheduling/preferences, check deletion errors before sign-out |
| Editorial | Migrations, synthetic seed, entity roster work | Reviewed sources, protected publish workflow, launch inventory and content QA |
| Operations | Release checklist and build profiles | Analytics/error reporting, automated RLS tests, real Supabase integration, accessibility/device/network QA, TestFlight |

The previous README overstated backend readiness: configuration alone does not connect every screen. Several screens still read local mock data directly.

## Existing scope differences preserved

- `docs/decisions.md` records a later user request for Finzy Pro despite the original exclusion of subscriptions. Its implementation was preserved.
- Rip It collectible packs are additional existing scope outside the baseline. Their purchase/entitlement/security behavior has not been validated by this pass.
- The decision log explains the SDK 57 upgrade. No downgrade was performed. The required v51 website URLs returned error pages; the versioned reference was read from Expo's official `sdk-51` repository branch: https://raw.githubusercontent.com/expo/expo/sdk-51/docs/pages/versions/v51.0.0/index.mdx.

## Continuation implemented

- Live quiz RPC errors and empty responses now fail explicitly rather than silently inventing demo correctness/XP.
- Quiz submission errors show retry feedback. A retry retains the answer and idempotency key, and synchronous duplicate taps are guarded.
- Question identity/version resets component state; practice cannot advance before an answer succeeds.
- Practice uses the available distinct demo questions rather than repeating two questions into a purported personalized five-question Daily Quiz.
- Live feed errors no longer substitute synthetic inventory. Existing query pages remain available in memory. Demo pagination ends instead of looping duplicate IDs into the same list.
- Regression coverage exercises live failure behavior, server-result preservation, question reset and retry identity.

## Next implementation order

1. Finish the authoritative learning slice: server-selected daily questions, numeric answers, replay/concurrency security, profile stats, guest progression and merge.
2. Persist onboarding, bookmarks/follows and feedback with account-scoped offline queues; add durable feed caching.
3. Connect discovery/entities and reviewed sources, then notifications, legal/support and account lifecycle error paths.
4. Complete RLS/integration tests, editorial inventory, analytics/crash reporting and device/TestFlight acceptance.

No remote services were deployed and no App Store submission was made. iOS JavaScript/Hermes export is a bundle check, not a signed native build or device test.

## Verification for this continuation

- `npm run typecheck`: passed.
- `npm run lint`: passed (existing legacy-config notice).
- `npm test -- --watchAll=false --runInBand`: 6 tests passed in 2 suites. Watchman required access outside the filesystem sandbox.
- `npx expo export --platform ios --output-dir /tmp/finzy-ios-export`: passed; generated the iOS Hermes bundle and assets.
- `git diff --check`: passed.
