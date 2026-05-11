import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { SaleEventWithArtist } from '@/types';

export function useUpcomingSales(skip: number, limit: number) {
  const [events, setEvents] = useState<SaleEventWithArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingSales = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/tours/upcoming-sales', {
        params: { skip, limit },
        signal,
      });
      setEvents(res.data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError('Failed to load upcoming sales');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [skip, limit]);

  useEffect(() => {
    const controller = new AbortController();
    fetchUpcomingSales(controller.signal);

    return () => controller.abort();
  }, [fetchUpcomingSales]);

  return { events, loading, error };
}
