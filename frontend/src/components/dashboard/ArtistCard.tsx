import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, X } from "lucide-react";
import type { Artist } from "@/types";

interface ArtistCardProps {
  artist: Artist;
  onUnfollow: (artistId: number) => void;
}

export function ArtistCard({ artist, onUnfollow }: ArtistCardProps) {
  const initials = artist.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/8 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_24px_oklch(0.65_0.26_280/0.15)]">
      {/* Unfollow button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full bg-black/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/80"
        onClick={(e) => {
          e.preventDefault();
          onUnfollow(artist.id);
        }}
      >
        <X className="h-3.5 w-3.5 text-white" />
      </Button>

      <Link to={`/artists/${artist.id}`}>
        {/* Image area */}
        <div className="relative aspect-square w-full overflow-hidden bg-secondary">
          {artist.image_url ? (
            <img
              src={artist.image_url}
              alt={artist.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-4xl font-bold text-primary/60">{initials}</span>
            </div>
          )}
          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
          {/* Artist name on image */}
          <div className="absolute bottom-0 inset-x-0 p-3">
            <h3 className="text-sm font-semibold text-white drop-shadow-md leading-tight">
              {artist.name}
            </h3>
          </div>
        </div>

        {/* Metadata below image */}
        <div className="p-3 space-y-2">
          {/* Genre badges */}
          <div className="flex flex-wrap gap-1">
            {artist.genres.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-0"
              >
                {genre}
              </Badge>
            ))}
          </div>

          {/* Next concert info */}
          {artist.next_concert_date ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span>{new Date(artist.next_concert_date).toLocaleDateString()}</span>
              </div>
              {artist.next_concert_venue && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{artist.next_concert_venue}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">No upcoming concerts</p>
          )}
        </div>
      </Link>
    </div>
  );
}
