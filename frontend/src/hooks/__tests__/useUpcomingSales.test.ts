import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUpcomingSales } from '../useUpcomingSales';
import api from '@/lib/api';
import type { SaleEventWithArtist } from '@/types';

vi.mock('@/lib/api');

describe('useUpcomingSales', () => {
  const mockSaleEvents: SaleEventWithArtist[] = [
    {
      id: 1,
      tour_id: 1,
      type: 'FC_LOTTERY',
      registration_start: '2026-05-12T00:00:00',
      registration_end: '2026-05-20T00:00:00',
      result_date: '2026-05-25T00:00:00',
      platform: 'Eplus',
      link: 'https://eplus.jp/example',
      notes: 'FC membership required',
      created_at: '2026-05-11T10:00:00',
      artist_name: 'Taylor Swift',
      artist_id: 1,
      tour_name: 'Eras Tour 2026',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches upcoming sales on mount', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockSaleEvents });

    const { result } = renderHook(() => useUpcomingSales(0, 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toEqual(mockSaleEvents);
    expect(result.current.error).toBeNull();
  });

  it('includes skip and limit in API request', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockSaleEvents });

    renderHook(() => useUpcomingSales(5, 20));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/tours/upcoming-sales',
        expect.objectContaining({
          params: { skip: 5, limit: 20 },
        })
      );
    });
  });

  it('refetches when skip changes', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockSaleEvents });

    const { rerender } = renderHook(
      ({ skip, limit }) => useUpcomingSales(skip, limit),
      { initialProps: { skip: 0, limit: 10 } }
    );

    await waitFor(() => {
      expect(vi.mocked(api.get).mock.calls.length).toBeGreaterThan(0);
    });

    vi.mocked(api.get).mockClear();

    rerender({ skip: 10, limit: 10 });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/tours/upcoming-sales',
        expect.objectContaining({
          params: { skip: 10, limit: 10 },
        })
      );
    });
  });

  it('refetches when limit changes', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockSaleEvents });

    const { rerender } = renderHook(
      ({ skip, limit }) => useUpcomingSales(skip, limit),
      { initialProps: { skip: 0, limit: 10 } }
    );

    await waitFor(() => {
      expect(vi.mocked(api.get).mock.calls.length).toBeGreaterThan(0);
    });

    vi.mocked(api.get).mockClear();

    rerender({ skip: 0, limit: 20 });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/tours/upcoming-sales',
        expect.objectContaining({
          params: { skip: 0, limit: 20 },
        })
      );
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUpcomingSales(0, 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load upcoming sales');
    expect(result.current.events).toEqual([]);
  });

  it('ignores AbortError when request is cancelled', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    vi.mocked(api.get).mockRejectedValue(abortError);

    const { result } = renderHook(() => useUpcomingSales(0, 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.events).toEqual([]);
  });

  it('clears error on successful refetch', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

    const { result, rerender } = renderHook(
      ({ skip }) => useUpcomingSales(skip, 10),
      { initialProps: { skip: 0 } }
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load upcoming sales');
    });

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSaleEvents });

    rerender({ skip: 1 });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.events).toEqual(mockSaleEvents);
    });
  });
});
