import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ExternalLink, Loader2, List, CalendarDays } from "lucide-react";
import api from "@/lib/api";
import type { WishlistItem } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  on_sale: "bg-green-500/15 text-green-400 border border-green-500/20",
  lottery_open: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  upcoming: "bg-blue-500",
  on_sale: "bg-green-500",
  lottery_open: "bg-orange-500",
};

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      setItems(res.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (concertId: number) => {
    try {
      await api.delete(`/wishlist/${concertId}`);
      setItems((prev) => prev.filter((item) => item.concert.id !== concertId));
    } catch {
      // handle error
    }
  };

  const concertDates = new Map<string, WishlistItem[]>();
  items.forEach((item) => {
    if (item.concert.date) {
      const dateKey = new Date(item.concert.date).toDateString();
      const existing = concertDates.get(dateKey) || [];
      existing.push(item);
      concertDates.set(dateKey, existing);
    }
  });

  const concertsOnSelectedDate = selectedDate
    ? concertDates.get(selectedDate.toDateString()) || []
    : [];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Wishlist</h1>
        <p className="text-muted-foreground">
          {items.length} concert{items.length !== 1 ? "s" : ""} in your wishlist
        </p>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <List className="mr-1 h-4 w-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="mr-1 h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Your wishlist is empty. Add concerts from artist pages.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {item.concert.date
                          ? new Date(item.concert.date).toLocaleDateString()
                          : "TBD"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.concert.title}
                      </TableCell>
                      <TableCell>{item.concert.artist_name}</TableCell>
                      <TableCell>{item.concert.venue}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.concert.platform}</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[item.concert.status] || ""
                          }`}
                        >
                          {item.concert.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFromWishlist(item.concert.id)}
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                          {item.concert.official_link && (
                            <a
                              href={item.concert.official_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <div className="grid gap-6 md:grid-cols-[350px_1fr]">
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    concert: Array.from(concertDates.keys()).map(
                      (d) => new Date(d)
                    ),
                  }}
                  modifiersClassNames={{
                    concert: "bg-primary/20 font-bold",
                  }}
                />
                <div className="mt-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS.upcoming}`} />
                    Upcoming
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS.on_sale}`} />
                    Tickets on sale
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS.lottery_open}`} />
                    Lottery registration open
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              {selectedDate ? (
                concertsOnSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold">
                      {selectedDate.toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    {concertsOnSelectedDate.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium">{item.concert.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.concert.artist_name} — {item.concert.venue},{" "}
                              {item.concert.location}
                            </p>
                            <div className="mt-1 flex gap-2">
                              <Badge variant="outline">
                                {item.concert.platform}
                              </Badge>
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  STATUS_COLORS[item.concert.status] || ""
                                }`}
                              >
                                {item.concert.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm font-medium">
                            {item.concert.price_range}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    No concerts on this date.
                  </p>
                )
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Select a date to see concerts. Highlighted dates have wishlisted concerts.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
