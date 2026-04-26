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
import { AddArtistDialog } from "@/components/dashboard/AddArtistDialog";
import { Loader2, Users } from "lucide-react";
import api from "@/lib/api";
import type { Artist } from "@/types";

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchArtists = useCallback(async () => {
    try {
      const res = await api.get("/artists/followed");
      // Backend returns artists ordered by position, so use that as source of truth
      setArtists(res.data);
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
        return next;
      });
    } catch {
      // handle error
    }
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
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
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
        <AddArtistDialog onArtistFollowed={fetchArtists} />
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
  );
}
