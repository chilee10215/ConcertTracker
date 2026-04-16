import { useState, useEffect, useCallback } from "react";
import { ArtistCard } from "@/components/dashboard/ArtistCard";
import { AddArtistDialog } from "@/components/dashboard/AddArtistDialog";
import { Loader2, Users } from "lucide-react";
import api from "@/lib/api";
import type { Artist } from "@/types";

const GENRE_FILTERS = ["All", "Pop", "K-Pop", "Rock", "J-Pop", "J-Rock", "R&B", "Hip-Hop"];

export function DashboardPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("All");

  const fetchArtists = useCallback(async () => {
    try {
      const res = await api.get("/artists/followed");
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

  const handleUnfollow = async (artistId: number) => {
    try {
      await api.delete(`/artists/follow/${artistId}`);
      setArtists((prev) => prev.filter((a) => a.id !== artistId));
    } catch {
      // handle error
    }
  };

  const filteredArtists =
    activeGenre === "All"
      ? artists
      : artists.filter((a) => a.genres.some((g) => g === activeGenre));

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
          {GENRE_FILTERS.map((genre) => (
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

      {/* Empty state */}
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onUnfollow={handleUnfollow}
            />
          ))}
        </div>
      )}
    </div>
  );
}
