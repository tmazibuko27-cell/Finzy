import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Guest/local progress cache. This is optimistic UI state, not the source of
 * truth — server-authoritative XP/streak/mastery come from Supabase once
 * configured. On sign-up, guest progress here should be merged into the
 * new account per the onboarding spec (guest -> account merge).
 */
type CollectionRecord = { count: number; firstUnlockedAt: string };

type LocalState = {
  savedCardIds: Set<string>;
  seenCardIds: Set<string>;
  followedTopicSlugs: Set<string>;
  guestXp: number;
  onboardingComplete: boolean;
  isPro: boolean;
  packBalance: number;
  lastDailyPackClaimDate: string | null;
  collection: Record<string, CollectionRecord>;
  hydrated: boolean;
  toggleSaved: (cardId: string) => void;
  markCardSeen: (cardId: string) => void;
  toggleFollow: (topicSlug: string) => void;
  addGuestXp: (amount: number) => void;
  completeOnboarding: () => void;
  setIsPro: (value: boolean) => void;
  claimDailyPackLocal: () => { claimed: boolean; balance: number };
  grantPacksLocal: (amount: number) => void;
  openPackLocal: (slug: string) => { isDuplicate: boolean; balance: number };
  hydrate: () => Promise<void>;
};

const STORAGE_KEY = 'finzy.localStore.v1';

type PersistableState = Pick<
  LocalState,
  | 'savedCardIds'
  | 'seenCardIds'
  | 'followedTopicSlugs'
  | 'guestXp'
  | 'onboardingComplete'
  | 'isPro'
  | 'packBalance'
  | 'lastDailyPackClaimDate'
  | 'collection'
>;

async function persist(state: PersistableState) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        savedCardIds: Array.from(state.savedCardIds),
        seenCardIds: Array.from(state.seenCardIds),
        followedTopicSlugs: Array.from(state.followedTopicSlugs),
        guestXp: state.guestXp,
        onboardingComplete: state.onboardingComplete,
        isPro: state.isPro,
        packBalance: state.packBalance,
        lastDailyPackClaimDate: state.lastDailyPackClaimDate,
        collection: state.collection,
      })
    );
  } catch {
    // Best-effort local cache; ignore persistence failures.
  }
}

function todayLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export const useLocalStore = create<LocalState>((set, get) => ({
  savedCardIds: new Set(),
  seenCardIds: new Set(),
  followedTopicSlugs: new Set(),
  guestXp: 0,
  onboardingComplete: false,
  isPro: false,
  packBalance: 0,
  lastDailyPackClaimDate: null,
  collection: {},
  hydrated: false,
  toggleSaved: (cardId) => {
    const next = new Set(get().savedCardIds);
    if (next.has(cardId)) next.delete(cardId);
    else next.add(cardId);
    set({ savedCardIds: next });
    persist({ ...get(), savedCardIds: next });
  },
  markCardSeen: (cardId) => {
    if (get().seenCardIds.has(cardId)) return;
    const next = new Set(get().seenCardIds);
    next.add(cardId);
    set({ seenCardIds: next });
    persist({ ...get(), seenCardIds: next });
  },
  toggleFollow: (topicSlug) => {
    const next = new Set(get().followedTopicSlugs);
    if (next.has(topicSlug)) next.delete(topicSlug);
    else next.add(topicSlug);
    set({ followedTopicSlugs: next });
    persist({ ...get(), followedTopicSlugs: next });
  },
  addGuestXp: (amount) => {
    const next = get().guestXp + amount;
    set({ guestXp: next });
    persist({ ...get(), guestXp: next });
  },
  completeOnboarding: () => {
    set({ onboardingComplete: true });
    persist({ ...get(), onboardingComplete: true });
  },
  setIsPro: (value) => {
    set({ isPro: value });
    persist({ ...get(), isPro: value });
  },
  claimDailyPackLocal: () => {
    const today = todayLocalDate();
    if (get().lastDailyPackClaimDate === today) {
      return { claimed: false, balance: get().packBalance };
    }
    const balance = get().packBalance + 1;
    set({ packBalance: balance, lastDailyPackClaimDate: today });
    persist({ ...get(), packBalance: balance, lastDailyPackClaimDate: today });
    return { claimed: true, balance };
  },
  grantPacksLocal: (amount) => {
    const balance = get().packBalance + amount;
    set({ packBalance: balance });
    persist({ ...get(), packBalance: balance });
  },
  openPackLocal: (slug) => {
    const state = get();
    if (state.packBalance < 1) throw new Error('No packs available');

    const balance = state.packBalance - 1;
    const existing = state.collection[slug];
    const isDuplicate = !!existing;
    const nextCollection: Record<string, CollectionRecord> = {
      ...state.collection,
      [slug]: existing
        ? { ...existing, count: existing.count + 1 }
        : { count: 1, firstUnlockedAt: new Date().toISOString() },
    };

    set({ packBalance: balance, collection: nextCollection });
    persist({ ...get(), packBalance: balance, collection: nextCollection });
    return { isDuplicate, balance };
  },
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          savedCardIds: new Set(parsed.savedCardIds ?? []),
          seenCardIds: new Set(parsed.seenCardIds ?? []),
          followedTopicSlugs: new Set(parsed.followedTopicSlugs ?? []),
          guestXp: parsed.guestXp ?? 0,
          onboardingComplete: parsed.onboardingComplete ?? false,
          isPro: parsed.isPro ?? false,
          packBalance: parsed.packBalance ?? 0,
          lastDailyPackClaimDate: parsed.lastDailyPackClaimDate ?? null,
          collection: parsed.collection ?? {},
        });
      }
    } finally {
      set({ hydrated: true });
    }
  },
}));
