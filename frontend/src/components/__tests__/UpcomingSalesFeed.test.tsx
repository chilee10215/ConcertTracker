import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpcomingSalesFeed } from '../UpcomingSalesFeed';
import * as useUpcomingSalesModule from '@/hooks/useUpcomingSales';
import type { SaleEventWithArtist } from '@/types';

vi.mock('@/hooks/useUpcomingSales');

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
    vi.mocked(useUpcomingSalesModule.useUpcomingSales).mockReturnValue({
      events: mockSaleEvents,
      loading: false,
      error: null,
    });

    render(<UpcomingSalesFeed />);

    expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
    expect(screen.getByText('The Weeknd')).toBeInTheDocument();
  });

  it('displays sale event details correctly', async () => {
    vi.mocked(useUpcomingSalesModule.useUpcomingSales).mockReturnValue({
      events: mockSaleEvents,
      loading: false,
      error: null,
    });

    render(<UpcomingSalesFeed />);

    expect(screen.getByText('Eras Tour 2026')).toBeInTheDocument();
    expect(screen.getByText('FC_LOTTERY')).toBeInTheDocument();
    expect(screen.getByText('Eplus')).toBeInTheDocument();
  });

  it('displays empty state when no sales events', async () => {
    vi.mocked(useUpcomingSalesModule.useUpcomingSales).mockReturnValue({
      events: [],
      loading: false,
      error: null,
    });

    render(<UpcomingSalesFeed />);

    expect(screen.getByText(/no upcoming sales/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    vi.mocked(useUpcomingSalesModule.useUpcomingSales).mockReturnValue({
      events: [],
      loading: true,
      error: null,
    });

    render(<UpcomingSalesFeed />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error message when fetch fails', () => {
    vi.mocked(useUpcomingSalesModule.useUpcomingSales).mockReturnValue({
      events: [],
      loading: false,
      error: 'Failed to load upcoming sales',
    });

    render(<UpcomingSalesFeed />);

    expect(screen.getByText('Failed to load upcoming sales')).toBeInTheDocument();
  });

  it('disables pagination buttons while loading', () => {
    vi.mocked(useUpcomingSalesModule.useUpcomingSales).mockReturnValue({
      events: mockSaleEvents,
      loading: true,
      error: null,
    });

    render(<UpcomingSalesFeed />);

    const previousButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('displays dates in readable format', () => {
    vi.mocked(useUpcomingSalesModule.useUpcomingSales).mockReturnValue({
      events: mockSaleEvents,
      loading: false,
      error: null,
    });

    render(<UpcomingSalesFeed />);

    const dateElements = screen.getAllByText(/May \d+, 2026/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});
