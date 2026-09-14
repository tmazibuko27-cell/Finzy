import { MOCK_FEED_CARDS } from '@/lib/mockFeed';
import { LABS } from '@/features/labs/catalog';
import type { FeedCard } from '@/types/content';

export type SearchResult = {
  id: string;
  kind: 'person' | 'company' | 'topic' | 'card' | 'lab';
  title: string;
  subtitle?: string;
  slug?: string;
  cardId?: string;
};

/**
 * Client-side demo search over mock inventory. Replace with a Supabase
 * full-text/trigram RPC once content is live — the ranking order below
 * (exact entity match -> prefix -> card body) matches the spec's priority.
 */
export function searchLocalContent(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const entityMatches = new Map<string, SearchResult>();
  const cardMatches: SearchResult[] = [];

  for (const card of MOCK_FEED_CARDS as FeedCard[]) {
    for (const entity of card.entities) {
      if (entity.name.toLowerCase().includes(q) || entity.type === q) {
        entityMatches.set(`${entity.type}-${entity.slug}`, {
          id: `${entity.type}-${entity.slug}`,
          kind: entity.type,
          title: entity.name,
          subtitle: entity.type,
          slug: entity.slug,
        });
      }
    }
    if (card.type === q || card.hook.toLowerCase().includes(q) || card.body.toLowerCase().includes(q)) {
      cardMatches.push({ id: card.id, kind: 'card', title: card.hook, subtitle: 'Card', cardId: card.id });
    }
  }

  const labs: SearchResult[] = LABS.filter((lab) => `${lab.title} ${lab.category} ${lab.subtitle} ${lab.brief}`.toLowerCase().includes(q))
    .map((lab) => ({ id: `lab-${lab.slug}`, kind: 'lab', title: lab.title, subtitle: 'Interactive lab', slug: lab.slug }));
  return [...entityMatches.values(), ...labs, ...cardMatches];
}
