export interface User {
  id: number;
  email: string;
  username?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface Artist {
  id: number;
  name: string;
  image_url: string;
  genres: string[];
  next_concert_date?: string | null;
  next_concert_venue?: string | null;
}

export interface ArtistSearchResult {
  name: string;
  image_url: string;
  genres: string[];
  source: string;
}

export interface Concert {
  id: number;
  artist_id: number;
  artist_name: string;
  title: string;
  date: string | null;
  location: string;
  venue: string;
  price_range: string;
  ticket_start_date: string | null;
  lottery_registration_date: string | null;
  platform: string;
  organizer: string;
  official_link: string;
  status: string;
  is_wishlisted: boolean;
  last_updated_at: string | null;
}

export interface WishlistItem {
  id: number;
  added_at: string;
  concert: Concert;
}
