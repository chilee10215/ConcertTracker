import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Heart, ExternalLink, Loader2 } from "lucide-react";
import api from "@/lib/api";
import type { Concert } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  on_sale: "bg-green-500/15 text-green-400 border border-green-500/20",
  lottery_open: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
};

export function ArtistConcertsPage() {
  const { id } = useParams<{ id: string }>();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const params: Record<string, string> = {};
        if (platformFilter && platformFilter !== "all") {
          params.platform = platformFilter;
        }
        const res = await api.get(`/concerts/artist/${id}`, { params });
        setConcerts(res.data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchConcerts();
  }, [id, platformFilter]);

  const toggleWishlist = async (concert: Concert) => {
    try {
      if (concert.is_wishlisted) {
        await api.delete(`/wishlist/${concert.id}`);
      } else {
        await api.post(`/wishlist/${concert.id}`);
      }
      setConcerts((prev) =>
        prev.map((c) =>
          c.id === concert.id ? { ...c, is_wishlisted: !c.is_wishlisted } : c
        )
      );
    } catch {
      // handle error
    }
  };

  const platforms = [...new Set(concerts.map((c) => c.platform).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const artistName = concerts[0]?.artist_name || "Artist";

  return (
    <div>
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{artistName} — Concerts</h1>
          <Select value={platformFilter} onValueChange={(val) => setPlatformFilter(val ?? "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {concerts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No concerts found for this artist.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {concerts.map((concert) => (
                <TableRow key={concert.id}>
                  <TableCell className="whitespace-nowrap">
                    {concert.date
                      ? new Date(concert.date).toLocaleDateString()
                      : "TBD"}
                  </TableCell>
                  <TableCell className="font-medium">{concert.title}</TableCell>
                  <TableCell>{concert.venue}</TableCell>
                  <TableCell>{concert.location}</TableCell>
                  <TableCell>{concert.price_range}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{concert.platform}</Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[concert.status] || ""
                      }`}
                    >
                      {concert.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleWishlist(concert)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            concert.is_wishlisted
                              ? "fill-red-500 text-red-500"
                              : ""
                          }`}
                        />
                      </Button>
                      {concert.official_link && (
                        <a
                          href={concert.official_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
    </div>
  );
}
