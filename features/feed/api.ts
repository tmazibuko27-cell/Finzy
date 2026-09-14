import { supabase } from '@/lib/supabase';
import { MOCK_FEED_CARDS } from '@/lib/mockFeed';
import type { FeedPage } from '@/types/content';

const PAGE_SIZE = 6;

/**
 * Fetches one page of the personalized feed.
 * Demo content is used only when no backend is configured. Live failures
 * propagate to the query layer, which preserves previously loaded pages.
 */
export async function fetchFeedPage(cursor: string | null, seenCardIds: Set<string> = new Set()): Promise<FeedPage> {
  if (supabase) {
    const { data, error } = await supabase.rpc('get_feed', { cursor, limit: PAGE_SIZE });
    if (error) throw error;
    if (!data) throw new Error('Feed returned no data');
    return data as FeedPage;
  }

  return fetchMockFeedPage(cursor, seenCardIds);
}

function fetchMockFeedPage(cursor: string | null, seenCardIds: Set<string>): FeedPage {
  const unseenCards = MOCK_FEED_CARDS.filter((card) => !seenCardIds.has(card.id));
  const startIndex = cursor ? Number(cursor) : 0;
  const slice = unseenCards.slice(startIndex, startIndex + PAGE_SIZE);
  const nextIndex = startIndex + slice.length;


  return {
    cards: slice,
    nextCursor: nextIndex < unseenCards.length ? String(nextIndex) : null,
  };
}
