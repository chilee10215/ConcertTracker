import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Artist } from "@/types";
import api from "@/lib/api";

interface TourFormProps {
  artists: Artist[];
  onSuccess: (newTour?: any) => void;
}

export function TourForm({ artists, onSuccess }: TourFormProps) {
  const [artistId, setArtistId] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleArtistChange = (value: string | null) => {
    if (value !== null) setArtistId(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!artistId || !name) {
      setError("Artist and tour name are required");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/tours", {
        artist_id: parseInt(artistId, 10),
        name,
        description,
        year: year ? parseInt(year, 10) : null,
      });
      setSuccess("Tour created successfully!");
      setArtistId("");
      setName("");
      setYear("");
      setDescription("");
      onSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create tour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-500">
          {success}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="artist" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Artist
        </Label>
        <Select value={artistId} onValueChange={handleArtistChange}>
          <SelectTrigger className="border-white/10 bg-white/5">
            <SelectValue placeholder="Select an artist" />
          </SelectTrigger>
          <SelectContent>
            {artists.map((artist) => (
              <SelectItem key={artist.id} value={artist.id.toString()}>
                {artist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tour-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Tour Name
        </Label>
        <Input
          id="tour-name"
          placeholder="e.g., Summer Live 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-white/10 bg-white/5 focus-visible:border-primary/50 focus-visible:ring-primary/20"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tour-year" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Year (Optional)
          </Label>
          <Input
            id="tour-year"
            type="number"
            placeholder="2026"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border-white/10 bg-white/5 focus-visible:border-primary/50 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tour-desc" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Description (Optional)
        </Label>
        <textarea
          id="tour-desc"
          placeholder="Tour description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_16px_oklch(0.65_0.26_280/0.35)]"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Tour"}
      </Button>
    </form>
  );
}
