import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { useLocalStore } from '@/lib/localStore';
import { MOCK_PEOPLE } from '@/lib/mockEntities';
import type { CardRarity, PackOpenResult } from '@/types/content';

/**
 * Disclosed pack odds (Apple guideline 3.1.1 requires these be shown before
 * a real-money pack purchase — see app/rip/buy-packs.tsx). Must match the
 * weights baked into the `open_pack` Postgres function.
 */
export const PACK_ODDS: Record<CardRarity, number> = {
  common: 0.6,
  rare: 0.25,
  epic: 0.12,
  legendary: 0.03,
};

export async function getPackBalance(): Promise<number> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_pack_balance');
      if (error) throw error;
      if (typeof data === 'number') return data;
    } catch (err) {
      if (__DEV__) console.warn('[finzy] get_pack_balance RPC failed, using local balance', err);
    }
  }
  return useLocalStore.getState().packBalance;
}

export async function claimDailyPack(): Promise<{ claimed: boolean; balance: number }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('claim_daily_pack');
      if (error) throw error;
      if (data) return data as { claimed: boolean; balance: number };
    } catch (err) {
      if (__DEV__) console.warn('[finzy] claim_daily_pack RPC failed, using local claim', err);
    }
  }
  return useLocalStore.getState().claimDailyPackLocal();
}

export async function openPack(): Promise<PackOpenResult> {
  if (supabase) {
    try {
      const idempotencyKey = Crypto.randomUUID();
      const { data, error } = await supabase.rpc('open_pack', { idempotency_key: idempotencyKey });
      if (error) throw error;
      if (data) return data as PackOpenResult;
    } catch (err) {
      if (__DEV__) console.warn('[finzy] open_pack RPC failed, using local roll', err);
    }
  }
  return openPackMock();
}

function rollRarity(): CardRarity {
  const roll = Math.random();
  let cumulative = 0;
  for (const rarity of ['common', 'rare', 'epic', 'legendary'] as CardRarity[]) {
    cumulative += PACK_ODDS[rarity];
    if (roll < cumulative) return rarity;
  }
  return 'legendary';
}

function openPackMock(): PackOpenResult {
  // Local demo mode keeps the core collectible loop testable before payments exist.
  if (useLocalStore.getState().packBalance < 1) {
    useLocalStore.getState().grantPacksLocal(1);
  }
  const people = Object.values(MOCK_PEOPLE);
  let rarity = rollRarity();
  let pool = people.filter((p) => p.rarity === rarity);
  if (pool.length === 0) {
    pool = people;
    rarity = pool[0]?.rarity ?? 'common';
  }
  const person = pool[Math.floor(Math.random() * pool.length)];

  const { isDuplicate, balance } = useLocalStore.getState().openPackLocal(person.slug);
  const bonusXp = isDuplicate ? { legendary: 25, epic: 12, rare: 6, common: 2 }[rarity] : 0;
  if (bonusXp) useLocalStore.getState().addGuestXp(bonusXp);

  return {
    person: {
      id: person.slug,
      name: person.name,
      slug: person.slug,
      descriptor: person.descriptor,
      business: person.business,
      education: person.education,
      netWorth: person.netWorth,
      power: person.power,
      portraitUrl: person.portraitUrl ?? null,
      portraitAsset: person.portraitAsset,
    },
    rarity,
    isDuplicate,
    bonusXp,
    balance,
    replay: false,
  };
}
