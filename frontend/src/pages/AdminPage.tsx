import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Artist, Tour } from "@/types";
import api from "@/lib/api";

export function AdminPage() {
  // Tour form state
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tourArtistId, setTourArtistId] = useState("");
  const [tourName, setTourName] = useState("");
  const [tourYear, setTourYear] = useState("");
  const [tourDescription, setTourDescription] = useState("");
  const [tourLoading, setTourLoading] = useState(false);
  const [tourError, setTourError] = useState("");
  const [tourSuccess, setTourSuccess] = useState("");

  // Sale event form state
  const [tours, setTours] = useState<Tour[]>([]);
  const [tourId, setTourId] = useState("");
  const [saleType, setSaleType] = useState("");
  const [platform, setPlatform] = useState("");
  const [registrationStart, setRegistrationStart] = useState("");
  const [registrationEnd, setRegistrationEnd] = useState("");
  const [resultDate, setResultDate] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleError, setSaleError] = useState("");
  const [saleSuccess, setSaleSuccess] = useState("");

  // Wrapper functions for Select component which can pass null
  const handleTourArtistChange = (value: string | null) => {
    if (value !== null) setTourArtistId(value);
  };
  const handleTourIdChange = (value: string | null) => {
    if (value !== null) setTourId(value);
  };
  const handleSaleTypeChange = (value: string | null) => {
    if (value !== null) setSaleType(value);
  };
  const handlePlatformChange = (value: string | null) => {
    if (value !== null) setPlatform(value);
  };

  // Fetch artists on mount
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await api.get("/artists");
        setArtists(response.data);
      } catch (err) {
        console.error("Failed to fetch artists:", err);
      }
    };
    fetchArtists();
  }, []);

  // Fetch all tours on mount
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await api.get("/artists");
        const allTours: Tour[] = [];
        for (const artist of response.data) {
          const toursResponse = await api.get(`/tours/artist/${artist.id}`);
          allTours.push(...toursResponse.data);
        }
        setTours(allTours);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      }
    };
    fetchTours();
  }, []);

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourError("");
    setTourSuccess("");

    if (!tourArtistId || !tourName) {
      setTourError("Artist and tour name are required");
      return;
    }

    setTourLoading(true);
    try {
      await api.post("/tours", {
        artist_id: parseInt(tourArtistId),
        name: tourName,
        description: tourDescription,
        year: tourYear ? parseInt(tourYear) : null,
      });
      setTourSuccess("Tour created successfully!");
      setTourArtistId("");
      setTourName("");
      setTourYear("");
      setTourDescription("");
      // Refetch tours
      const response = await api.get("/artists");
      const allTours: Tour[] = [];
      for (const artist of response.data) {
        const toursResponse = await api.get(`/tours/artist/${artist.id}`);
        allTours.push(...toursResponse.data);
      }
      setTours(allTours);
    } catch (err: any) {
      setTourError(err.response?.data?.detail || "Failed to create tour");
    } finally {
      setTourLoading(false);
    }
  };

  const handleSaleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError("");
    setSaleSuccess("");

    if (!tourId || !saleType || !platform || !registrationStart || !registrationEnd) {
      setSaleError("Tour, type, platform, and dates are required");
      return;
    }

    setSaleLoading(true);
    try {
      await api.post("/tours/sale-events", {
        tour_id: parseInt(tourId),
        type: saleType,
        platform,
        registration_start: new Date(registrationStart).toISOString(),
        registration_end: new Date(registrationEnd).toISOString(),
        result_date: resultDate ? new Date(resultDate).toISOString() : null,
        link,
        notes,
      });
      setSaleSuccess("Sale event created successfully!");
      setTourId("");
      setSaleType("");
      setPlatform("");
      setRegistrationStart("");
      setRegistrationEnd("");
      setResultDate("");
      setLink("");
      setNotes("");
    } catch (err: any) {
      setSaleError(err.response?.data?.detail || "Failed to create sale event");
    } finally {
      setSaleLoading(false);
    }
  };

  // Group tours by artist for display
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
    <div className="min-h-[85vh] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="mt-2 text-muted-foreground">Manage tours and sale events</p>
        </div>

        <Tabs defaultValue="tour" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tour">Add Tour</TabsTrigger>
            <TabsTrigger value="sale">Add Sale Event</TabsTrigger>
          </TabsList>

          {/* Add Tour Tab */}
          <TabsContent value="tour" className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-card p-6 shadow-xl">
              <form onSubmit={handleTourSubmit} className="space-y-4">
                {tourError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    {tourError}
                  </div>
                )}
                {tourSuccess && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-500">
                    {tourSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="artist" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Artist
                  </Label>
                  <Select value={tourArtistId} onValueChange={handleTourArtistChange}>
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
                    value={tourName}
                    onChange={(e) => setTourName(e.target.value)}
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
                      value={tourYear}
                      onChange={(e) => setTourYear(e.target.value)}
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
                    value={tourDescription}
                    onChange={(e) => setTourDescription(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_16px_oklch(0.65_0.26_280/0.35)]"
                  disabled={tourLoading}
                >
                  {tourLoading ? "Creating..." : "Create Tour"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Add Sale Event Tab */}
          <TabsContent value="sale" className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-card p-6 shadow-xl">
              <form onSubmit={handleSaleEventSubmit} className="space-y-4">
                {saleError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    {saleError}
                  </div>
                )}
                {saleSuccess && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-500">
                    {saleSuccess}
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
                  disabled={saleLoading}
                >
                  {saleLoading ? "Creating..." : "Create Sale Event"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
