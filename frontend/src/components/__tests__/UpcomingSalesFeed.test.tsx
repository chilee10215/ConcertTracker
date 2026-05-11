import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpcomingSalesFeed } from '../UpcomingSalesFeed';
import api from '@/lib/api';
import type { SaleEventWithArtist } from '@/types';

vi.mock('@/lib/api');

describe('UpcomingSalesFeed', () => {
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
    {
      id: 2,
      tour_id: 2,
      type: 'GENERAL_SALE',
      registration_start: '2026-05-15T00:00:00',
      registration_end: '2026-05-30T00:00:00',
      result_date: null,
      platform: 'Pia',
      link: 'https://pia.jp/example',
      notes: '',
      created_at: '2026-05-11T10:00:00',
      artist_name: 'The Weeknd',
      artist_id: 2,
      tour_name: 'After Hours Tour 2026',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays upcoming sale events', async () => {
    (api.get as any).mockResolvedValue({
      data: mockSaleEvents,
    });

    render(<UpcomingSalesFeed />);

    await waitFor(() => {
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      expect(screen.getByText('The Weeknd')).toBeInTheDocument();
    });
  });

  it('displays sale event details correctly', async () => {
    (api.get as any).mockResolvedValue({
      data: mockSaleEvents,
    });

    render(<UpcomingSalesFeed />);

    await waitFor(() => {
      expect(screen.getByText('Eras Tour 2026')).toBeInTheDocument();
      expect(screen.getByText('FC_LOTTERY')).toBeInTheDocument();
      expect(screen.getByText('Eplus')).toBeInTheDocument();
    });
  });

  it('displays empty state when no sales events', async () => {
    (api.get as any).mockResolvedValue({
      data: [],
    });

    render(<UpcomingSalesFeed />);

    await waitFor(() => {
      expect(screen.getByText(/no upcoming sales/i)).toBeInTheDocument();
    });
  });

  it('supports pagination with skip and limit', async () => {
    (api.get as any).mockResolvedValue({
      data: mockSaleEvents.slice(0, 1),
    });

    render(<UpcomingSalesFeed />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/tours/upcoming-sales',
        expect.objectContaining({
          params: expect.objectContaining({
            skip: 0,
            limit: expect.any(Number),
          }),
        })
      );
    });
  });

  it('shows loading state initially', () => {
    (api.get as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<UpcomingSalesFeed />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has next button that is enabled when there are more results', async () => {
    (api.get as any).mockResolvedValue({
      data: mockSaleEvents,
    });

    render(<UpcomingSalesFeed limit={1} />);

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('displays dates in readable format', async () => {
    (api.get as any).mockResolvedValue({
      data: mockSaleEvents,
    });

    render(<UpcomingSalesFeed />);

    await waitFor(() => {
      // Should display formatted dates like "May 20, 2026"
      const dateElements = screen.getAllByText(/May \d+, 2026/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });
});
