import { useState, useEffect, useCallback } from "react";
import { ArtistCard } from "@/components/dashboard/ArtistCard";
import { AddArtistDialog } from "@/components/dashboard/AddArtistDialog";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import type { Artist } from "@/types";

export function DashboardPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your favorite artists and their upcoming concerts
          </p>
        </div>
        <AddArtistDialog onArtistFollowed={fetchArtists} />
      </div>

      {artists.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg text-muted-foreground">
            You're not following any artists yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Click "Follow Artist" to start tracking concerts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {artists.map((artist) => (
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
