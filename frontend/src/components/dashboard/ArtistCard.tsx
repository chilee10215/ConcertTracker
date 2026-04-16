import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, MapPin, X } from "lucide-react";
import type { Artist } from "@/types";

interface ArtistCardProps {
  artist: Artist;
  onUnfollow: (artistId: number) => void;
}

export function ArtistCard({ artist, onUnfollow }: ArtistCardProps) {
  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          onUnfollow(artist.id);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
      <Link to={`/artists/${artist.id}`}>
        <CardContent className="flex flex-col items-center gap-3 p-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={artist.image_url} alt={artist.name} />
            <AvatarFallback className="text-2xl">
              {artist.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-semibold">{artist.name}</h3>
            <div className="mt-1 flex flex-wrap justify-center gap-1">
              {artist.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
          {artist.next_concert_date && (
            <div className="mt-2 text-center text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(artist.next_concert_date).toLocaleDateString()}
              </div>
              {artist.next_concert_venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {artist.next_concert_venue}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
