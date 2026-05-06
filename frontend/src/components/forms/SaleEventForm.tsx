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
import type { Tour, Artist } from "@/types";
import api from "@/lib/api";
import { safeParseDate, isValidDateString, isEndDateAfterStartDate } from "@/lib/dateUtils";

interface SaleEventFormProps {
  tours: Tour[];
  artists: Artist[];
  onSuccess: () => void;
}

export function SaleEventForm({ tours, artists, onSuccess }: SaleEventFormProps) {
  const [tourId, setTourId] = useState("");
  const [saleType, setSaleType] = useState("");
  const [platform, setPlatform] = useState("");
  const [registrationStart, setRegistrationStart] = useState("");
  const [registrationEnd, setRegistrationEnd] = useState("");
  const [resultDate, setResultDate] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTourIdChange = (value: string | null) => {
    if (value !== null) setTourId(value);
  };

  const handleSaleTypeChange = (value: string | null) => {
    if (value !== null) setSaleType(value);
  };

  const handlePlatformChange = (value: string | null) => {
    if (value !== null) setPlatform(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!tourId || !saleType || !platform || !registrationStart || !registrationEnd) {
      setError("Tour, type, platform, and dates are required");
      return;
    }

    if (!isValidDateString(registrationStart)) {
      setError("Registration start date is invalid");
      return;
    }

    if (!isValidDateString(registrationEnd)) {
      setError("Registration end date is invalid");
      return;
    }

    if (!isEndDateAfterStartDate(registrationStart, registrationEnd)) {
      setError("Registration end date must be after start date");
      return;
    }

    // Safe date parsing
    const startIso = safeParseDate(registrationStart);
    const endIso = safeParseDate(registrationEnd);
    const resultIso = resultDate ? safeParseDate(resultDate) : null;

    if (!startIso || !endIso) {
      setError("Failed to parse dates");
      return;
    }

    setLoading(true);
    try {
      await api.post("/tours/sale-events", {
        tour_id: parseInt(tourId, 10),
        type: saleType,
        platform,
        registration_start: startIso,
        registration_end: endIso,
        result_date: resultIso,
        link,
        notes,
      });
      setSuccess("Sale event created successfully!");
      setTourId("");
      setSaleType("");
      setPlatform("");
      setRegistrationStart("");
      setRegistrationEnd("");
      setResultDate("");
      setLink("");
      setNotes("");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create sale event");
    } finally {
      setLoading(false);
    }
  };

  // Group tours by artist for better UX
  const toursByArtist = tours.reduce((acc, tour) => {
    const artist = artists.find((a) => a.id === tour.artist_id);
    if (artist) {
      if (!acc[artist.name]) {
        acc[artist.name] = [];
      }
      acc[artist.name].push(tour);
    }
    return acc;
  }, {} as Record<string, Tour[]>);

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
        <Label htmlFor="tour-select" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Tour
        </Label>
        <Select value={tourId} onValueChange={handleTourIdChange}>
          <SelectTrigger className="border-white/10 bg-white/5">
            <SelectValue placeholder="Select a tour" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(toursByArtist).map(([artistName, artistTours]) => (
              <div key={artistName}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{artistName}</div>
                {artistTours.map((tour) => (
                  <SelectItem key={tour.id} value={tour.id.toString()}>
                    {tour.name} {tour.year ? `(${tour.year})` : ""}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="type" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Type
          </Label>
          <Select value={saleType} onValueChange={handleSaleTypeChange}>
            <SelectTrigger className="border-white/10 bg-white/5">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FC_LOTTERY">FC Lottery</SelectItem>
              <SelectItem value="GENERAL_LOTTERY">General Lottery</SelectItem>
              <SelectItem value="GENERAL_SALE">General Sale</SelectItem>
              <SelectItem value="REMAINING">Remaining</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="platform" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Platform
          </Label>
          <Select value={platform} onValueChange={handlePlatformChange}>
            <SelectTrigger className="border-white/10 bg-white/5">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Eplus">Eplus</SelectItem>
              <SelectItem value="Pia">Pia</SelectItem>
              <SelectItem value="Lawson">Lawson</SelectItem>
              <SelectItem value="Melon">Melon</SelectItem>
              <SelectItem value="Interpark">Interpark</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="reg-start" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Registration Start
          </Label>
          <Input
            id="reg-start"
            type="datetime-local"
            value={registrationStart}
            onChange={(e) => setRegistrationStart(e.target.value)}
            className="border-white/10 bg-white/5 focus-visible:border-primary/50 focus-visible:ring-primary/20"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-end" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Registration End
          </Label>
          <Input
            id="reg-end"
            type="datetime-local"
            value={registrationEnd}
            onChange={(e) => setRegistrationEnd(e.target.value)}
            className="border-white/10 bg-white/5 focus-visible:border-primary/50 focus-visible:ring-primary/20"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="result-date" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Result Date (Optional)
        </Label>
        <Input
          id="result-date"
          type="datetime-local"
          value={resultDate}
          onChange={(e) => setResultDate(e.target.value)}
          className="border-white/10 bg-white/5 focus-visible:border-primary/50 focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="link" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Link
        </Label>
        <Input
          id="link"
          placeholder="https://example.com/sale"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="border-white/10 bg-white/5 focus-visible:border-primary/50 focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Notes (Optional)
        </Label>
        <textarea
          id="notes"
          placeholder="Additional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_16px_oklch(0.65_0.26_280/0.35)]"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Sale Event"}
      </Button>
    </form>
  );
}
