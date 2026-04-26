import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArtistCard } from "@/components/dashboard/ArtistCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Users,
  Search,
  X,
  Music2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import api from "@/lib/api";
import type { Artist, ArtistSearchResult } from "@/types";

const STORAGE_KEY = "artist-card-order";

function loadSavedOrder(): number[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : null;
  } catch {
    return null;
  }
}

function saveOrderToStorage(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

// ────────────────────────────────────────────────────────────────────────────
// Sortable card wrapper
// ────────────────────────────────────────────────────────────────────────────
interface SortableArtistCardProps {
  artist: Artist;
  onUnfollow: (id: number) => void;
}

function SortableArtistCard({ artist, onUnfollow }: SortableArtistCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: artist.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Drag to reorder ${artist.name}`}
    >
      <ArtistCard artist={artist} onUnfollow={onUnfollow} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Dashboard page
// ────────────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("All");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArtistSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [followedNames, setFollowedNames] = useState<Set<string>>(new Set());
  const [followingName, setFollowingName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Click outside handler to dismiss search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setQuery("");
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchArtists = useCallback(async () => {
    try {
      const res = await api.get("/artists/followed");
      // Backend returns artists ordered by position, so use that as source of truth
      setArtists(res.data);
      // Update followed names for search feature
      const names: string[] = res.data.map((a: { name: string }) => a.name);
      setFollowedNames(new Set(names));
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // Flush pending save when component unmounts
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        // Trigger save immediately on unmount
        const saved = loadSavedOrder();
        if (saved) {
          api.put("/artists/reorder", { artist_ids: saved }).catch(() => {});
        }
      }
    };
  }, []);

  const handleUnfollow = async (artistId: number) => {
    try {
      await api.delete(`/artists/follow/${artistId}`);
      setArtists((prev) => {
        const next = prev.filter((a) => a.id !== artistId);
        saveOrderToStorage(next.map((a) => a.id));
        // Update followed names in search
        const unfollowedName = prev.find((a) => a.id === artistId)?.name;
        if (unfollowedName) {
          setFollowedNames((prevNames) => {
            const newNames = new Set(prevNames);
            newNames.delete(unfollowedName);
            return newNames;
          });
        }
        return next;
      });
    } catch {
      // handle error
    }
  };

  const handleFollow = async (artist: ArtistSearchResult) => {
    setFollowingName(artist.name);
    try {
      await api.post("/artists/follow", {
        name: artist.name,
        image_url: artist.image_url,
        genres: artist.genres,
      });
      setFollowedNames((prev) => new Set([...prev, artist.name]));
      // Refresh artists list to show new followed artist
      fetchArtists();
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

  const persistOrder = useCallback((ids: number[]) => {
    saveOrderToStorage(ids);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      api.put("/artists/reorder", { artist_ids: ids }).catch(() => {});
    }, 800);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setArtists((prev) => {
      const oldIndex = prev.findIndex((a) => a.id === active.id);
      const newIndex = prev.findIndex((a) => a.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      persistOrder(reordered.map((a) => a.id));
      return reordered;
    });
  };

  const genreFilters = useMemo(() => {
    const uniqueGenres = Array.from(
      new Set(artists.flatMap((a) => a.genres))
    ).sort();
    return ["All", ...uniqueGenres];
  }, [artists]);

  const filteredArtists = useMemo(
    () =>
      activeGenre === "All"
        ? artists
        : artists.filter((a) => a.genres.some((g) => g === activeGenre)),
    [artists, activeGenre]
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Search Section */}
      <div className="flex flex-col items-center px-4">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold tracking-tight">Find Artists</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Search and follow artists to track their concerts
          </p>
        </div>

        {/* Search bar */}
        <div ref={searchContainerRef} className="relative w-full max-w-xl">
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
          <div className="absolute left-0 right-0 top-full z-50 mt-2">
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
              <div className="max-h-[60vh] space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-[oklch(0.08_0.01_280)] p-2 pr-1 shadow-xl scrollbar-thin">
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
          </div>
        </div>
      </div>

      {/* Followed Artists Section */}
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Following
            {artists.length > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                {artists.length} artist{artists.length !== 1 ? "s" : ""}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track concerts from your followed artists
          </p>
        </div>

        {/* Genre filter pills */}
        {artists.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {genreFilters.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  activeGenre === genre
                    ? "bg-primary text-white shadow-[0_0_12px_oklch(0.65_0.26_280/0.4)]"
                    : "border border-white/10 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}

        {/* Card grid with drag-and-drop */}
        {artists.length === 0 ? (
          <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary/60" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">No artists followed yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Search and follow artists to track their concerts
              </p>
            </div>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="flex h-[30vh] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No {activeGenre} artists in your list.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredArtists.map((a) => a.id)}
              strategy={rectSortingStrategy}
            >
              {/* Larger cards: max 4 per row on desktop (up from 6) */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredArtists.map((artist) => (
                  <SortableArtistCard
                    key={artist.id}
                    artist={artist}
                    onUnfollow={handleUnfollow}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
