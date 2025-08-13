import { EventItem, getEventById, searchEvents } from '@/common/api/ticketmaster';
import { useQuery } from '@tanstack/react-query';

export function useSearchEvents(keyword: string, city: string) {
  return useQuery({
    queryKey: ['events', { keyword, city }],
    queryFn: () => searchEvents({ keyword: keyword || undefined, city: city || undefined }),
    enabled: Boolean(keyword || city),
  });
}

export function useEventDetails(id?: string) {
  return useQuery<EventItem | null>({
    queryKey: ['event', id],
    queryFn: () => getEventById(id as string),
    enabled: Boolean(id),
  });
}

export function useFavoriteEvents(ids: string[]) {
  const key = ids.slice().sort().join(',');
  return useQuery<EventItem[]>({
    queryKey: ['favorites', key],
    queryFn: async () => {
      if (!key) return [];
      const results = await Promise.all(ids.map((id) => getEventById(id)));
      return results.filter((e): e is EventItem => Boolean(e));
    },
    enabled: ids.length > 0,
    refetchOnMount: 'always',
  });
}


