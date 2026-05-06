import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TourForm } from "@/components/forms/TourForm";
import { SaleEventForm } from "@/components/forms/SaleEventForm";
import type { Artist, Tour } from "@/types";
import api from "@/lib/api";

export function AdminPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch artists and tours on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [artistsRes, toursRes] = await Promise.all([
          api.get("/artists"),
          api.get("/tours/admin/all"),
        ]);
        setArtists(artistsRes.data);
        setTours(toursRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTourSuccess = (newTour?: any) => {
    if (newTour) {
      setTours((prev) => [...prev, newTour]);
    }
  };

  if (loading) {
    return <div className="flex min-h-[85vh] items-center justify-center">Loading...</div>;
  }

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

          <TabsContent value="tour" className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-card p-6 shadow-xl">
              <TourForm artists={artists} onSuccess={handleTourSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="sale" className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-card p-6 shadow-xl">
              <SaleEventForm tours={tours} artists={artists} onSuccess={handleTourSuccess} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
