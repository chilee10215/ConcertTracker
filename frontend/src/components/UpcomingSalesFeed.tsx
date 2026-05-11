import { useState } from 'react';
import { Loader2, ExternalLink, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUpcomingSales } from '@/hooks/useUpcomingSales';
import { SALE_TYPE_COLORS, PLATFORM_COLORS } from '@/constants/saleEventStyles';

interface UpcomingSalesFeedProps {
  limit?: number;
}

export function UpcomingSalesFeed({ limit = 10 }: UpcomingSalesFeedProps) {
  const [skip, setSkip] = useState(0);
  const { events, loading, error } = useUpcomingSales(skip, limit);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && events.length === 0) {
    return (
      <div
        className="flex h-32 items-center justify-center"
        role="status"
        aria-label="Loading upcoming sales"
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.length === 0 && skip === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-border bg-card/50 p-6 text-center">
          <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No upcoming sales for your followed artists.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
          <div
            key={event.id}
            className="rounded-lg border border-border bg-card/50 p-4 transition hover:bg-card/80"
          >
            {/* Header: Artist and Tour */}
            <div className="mb-3 flex flex-col justify-between sm:flex-row sm:items-start">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {event.artist_name}
                </h3>
                <p className="text-sm text-muted-foreground">{event.tour_name}</p>
              </div>
              <div className="mt-2 flex gap-2 sm:mt-0">
                <Badge
                  variant="secondary"
                  className={`${SALE_TYPE_COLORS[event.type]} border-0`}
                >
                  {event.type}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`${PLATFORM_COLORS[event.platform]} border-0`}
                >
                  {event.platform}
                </Badge>
              </div>
            </div>

            {/* Dates */}
            <div className="mb-3 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Registration: {formatDate(event.registration_start)} to{' '}
                  {formatDate(event.registration_end)}
                </span>
              </div>
              {event.result_date && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>Result date: {formatDate(event.result_date)}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {event.notes && (
              <p className="mb-3 text-sm text-muted-foreground italic">
                {event.notes}
              </p>
            )}

            {/* Link button */}
            {event.link && (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <a href={event.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </a>
              </Button>
            )}
          </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSkip(Math.max(0, skip - limit))}
          disabled={skip === 0 || loading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {Math.floor(skip / limit) + 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSkip(skip + limit)}
          disabled={events.length < limit || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
