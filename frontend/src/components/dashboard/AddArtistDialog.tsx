import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Plus } from "lucide-react";
import api from "@/lib/api";
import type { ArtistSearchResult } from "@/types";

interface AddArtistDialogProps {
  onArtistFollowed: () => void;
}

export function AddArtistDialog({ onArtistFollowed }: AddArtistDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArtistSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [followingName, setFollowingName] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get("/artists/search", { params: { q: query } });
        setResults(res.data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleFollow = async (artist: ArtistSearchResult) => {
    setFollowingName(artist.name);
    try {
      await api.post("/artists/follow", {
        name: artist.name,
        image_url: artist.image_url,
        genres: artist.genres,
      });
      onArtistFollowed();
      setOpen(false);
      setQuery("");
      setResults([]);
    } catch {
      // already following or error
    } finally {
      setFollowingName(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Plus className="mr-1 h-4 w-4" />
        Follow Artist
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Artists</DialogTitle>
          <DialogDescription>
            Find and follow artists to track their concerts.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for an artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!searching && results.length === 0 && query.trim() && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No artists found for "{query}"
            </div>
          )}
          {!searching &&
            results.map((artist) => (
              <div
                key={artist.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{artist.name}</p>
                  <div className="flex gap-1 mt-1">
                    {artist.genres.map((g) => (
                      <Badge key={g} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleFollow(artist)}
                  disabled={followingName === artist.name}
                >
                  {followingName === artist.name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Follow"
                  )}
                </Button>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
