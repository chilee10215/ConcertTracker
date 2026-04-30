import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ArtistCard } from "@/components/dashboard/ArtistCard";
import type { Artist } from "@/types";

const mockArtist: Artist = {
  id: 1,
  name: "Taylor Swift",
  image_url: "https://example.com/ts.jpg",
  genres: ["Pop", "Country"],
  next_concert_date: "2026-06-15T20:00:00",
  next_concert_venue: "Tokyo Dome",
};

function renderArtistCard(overrides: Partial<Artist> = {}, onUnfollow = vi.fn()) {
  return render(
    <MemoryRouter>
      <ArtistCard artist={{ ...mockArtist, ...overrides }} onUnfollow={onUnfollow} />
    </MemoryRouter>
  );
}

describe("ArtistCard", () => {
  it("renders the artist name", () => {
    renderArtistCard();
    expect(screen.getByText("Taylor Swift")).toBeInTheDocument();
  });

  it("renders up to 2 genre badges", () => {
    renderArtistCard();
    expect(screen.getByText("Pop")).toBeInTheDocument();
    expect(screen.getByText("Country")).toBeInTheDocument();
  });

  it("only shows max 2 genres when artist has more", () => {
    renderArtistCard({ genres: ["Pop", "Country", "Folk", "Rock"] });
    expect(screen.queryByText("Folk")).not.toBeInTheDocument();
    expect(screen.queryByText("Rock")).not.toBeInTheDocument();
  });

  it("renders the artist image when image_url is provided", () => {
    renderArtistCard();
    const img = screen.getByAltText("Taylor Swift");
    expect(img).toHaveAttribute("src", "https://example.com/ts.jpg");
  });

  it("renders initials when no image_url is provided", () => {
    renderArtistCard({ image_url: "" });
    expect(screen.getByText("TS")).toBeInTheDocument();
  });

  it("shows next concert venue when available", () => {
    renderArtistCard();
    expect(screen.getByText("Tokyo Dome")).toBeInTheDocument();
  });

  it("shows no upcoming concerts when next_concert_date is null", () => {
    renderArtistCard({ next_concert_date: null });
    expect(screen.getByText("No upcoming concerts")).toBeInTheDocument();
  });

  it("calls onUnfollow with the artist id when unfollow button is clicked", async () => {
    const onUnfollow = vi.fn();
    renderArtistCard({}, onUnfollow);
    await userEvent.click(screen.getByRole("button", { name: /unfollow taylor swift/i }));
    expect(onUnfollow).toHaveBeenCalledWith(1);
  });

  it("links to the artist detail page", () => {
    renderArtistCard();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/artists/1");
  });
});
