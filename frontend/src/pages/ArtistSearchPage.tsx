import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, UserCheck, UserPlus, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { ArtistSearchResult } from "@/types";

export function ArtistSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArtistSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [followedNames, setFollowedNames] = useState<Set<string>>(new Set());
  const [followingName, setFollowingName] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load names of already-followed artists to disable their buttons
  useEffect(() => {
    api
      .get("/artists/followed")
      .then((res) => {
        const names: string[] = res.data.map(
          (a: { name: string }) => a.name
        );
        setFollowedNames(new Set(names));
      })
      .catch(() => {});
  }, []);

  // Debounced search
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
      setFollowedNames((prev) => new Set([...prev, artist.name]));
    } catch {
      // already following or error — still mark as followed if 400
      setFollowedNames((prev) => new Set([...prev, artist.name]));
    } finally {
      setFollowingName(null);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col items-center px-4">
      {/* Page title */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Follow Artists</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search for artists and follow them to track their concerts
        </p>
      </div>

      {/* Centered search bar */}
      <div className="w-full max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artists..."
            className="border-white/10 bg-white/5 pl-9 pr-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            aria-label="Search artists"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results area */}
        <div className="mt-4">
          {/* Loading */}
          {searching && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
            </div>
          )}

          {/* No results */}
          {!searching && query.trim() && results.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Music2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No artists found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {/* Artist results */}
          {!searching && results.length > 0 && (
            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
              {results.map((artist) => {
                const isFollowing = followedNames.has(artist.name);
                const isPending = followingName === artist.name;

                return (
                  <div
                    key={artist.name}
                    className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 px-4 py-3 transition hover:bg-white/5"
                  >
                    {/* Artist image or fallback */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15">
                      {artist.image_url ? (
                        <img
                          src={artist.image_url}
                          alt={artist.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {artist.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Name + genres */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{artist.name}</p>
                      {artist.genres.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {artist.genres.slice(0, 3).map((g) => (
                            <Badge
                              key={g}
                              variant="secondary"
                              className="h-4 px-1.5 text-[10px]"
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Follow button */}
                    <Button
                      size="sm"
                      variant={isFollowing ? "ghost" : "default"}
                      disabled={isFollowing || isPending}
                      onClick={() => !isFollowing && handleFollow(artist)}
                      className="shrink-0"
                      aria-label={
                        isFollowing
                          ? `Already following ${artist.name}`
                          : `Follow ${artist.name}`
                      }
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="mr-1.5 h-4 w-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-1.5 h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Idle state with no query */}
          {!query && !searching && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
              <Search className="h-10 w-10 opacity-20" />
              <p className="text-sm">Start typing to search for artists</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
