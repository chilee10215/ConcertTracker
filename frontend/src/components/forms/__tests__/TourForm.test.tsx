import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TourForm } from "../TourForm";

const mockArtists = [
  { id: 1, name: "Taylor Swift", image_url: "http://example.com/1.jpg", genres: ["Pop"] },
  { id: 2, name: "BTS", image_url: "http://example.com/2.jpg", genres: ["K-Pop"] },
];

describe("TourForm", () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders tour form with all fields", () => {
    render(<TourForm artists={mockArtists} onSuccess={mockOnSuccess} />);

    expect(screen.getByText("Tour Name")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
    expect(screen.getByText("Year (Optional)")).toBeInTheDocument();
    expect(screen.getByText("Description (Optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create tour/i })).toBeInTheDocument();
  });

  it("renders the artist select dropdown", () => {
    render(<TourForm artists={mockArtists} onSuccess={mockOnSuccess} />);

    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toBeInTheDocument();
  });

  it("renders form inputs for all tour fields", () => {
    render(<TourForm artists={mockArtists} onSuccess={mockOnSuccess} />);

    expect(screen.getByPlaceholderText("e.g., Summer Live 2026")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("2026")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tour description")).toBeInTheDocument();
  });

  it("does not call onSuccess before form submission", () => {
    render(<TourForm artists={mockArtists} onSuccess={mockOnSuccess} />);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
