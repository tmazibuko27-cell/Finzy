import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeedPage } from './api';
import { useLocalStore } from '@/lib/localStore';

export function useFeed() {
  const seenCardIds = useLocalStore((s) => s.seenCardIds);

  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam as string | null, seenCardIds),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5,
  });
}
