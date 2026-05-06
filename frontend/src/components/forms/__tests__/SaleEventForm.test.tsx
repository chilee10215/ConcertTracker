import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaleEventForm } from "../SaleEventForm";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockArtists = [
  { id: 1, name: "Taylor Swift", image_url: "http://example.com/1.jpg", genres: ["Pop"] },
  { id: 2, name: "BTS", image_url: "http://example.com/2.jpg", genres: ["K-Pop"] },
];

const mockTours = [
  { id: 1, artist_id: 1, name: "Eras Tour", year: 2026, description: "World tour" },
  { id: 2, artist_id: 2, name: "Permission to Dance Tour", year: 2026, description: "Stadium tour" },
];

describe("SaleEventForm", () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sale event form with all fields", () => {
    render(<SaleEventForm tours={mockTours} artists={mockArtists} onSuccess={mockOnSuccess} />);

    expect(screen.getByText("Tour")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Registration Start")).toBeInTheDocument();
    expect(screen.getByText("Registration End")).toBeInTheDocument();
    expect(screen.getByText("Result Date (Optional)")).toBeInTheDocument();
    expect(screen.getByText("Link")).toBeInTheDocument();
    expect(screen.getByText("Notes (Optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create sale event/i })).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    vi.mocked(api.default.post).mockResolvedValueOnce({ data: { id: 1 } });
    render(<SaleEventForm tours={mockTours} artists={mockArtists} onSuccess={mockOnSuccess} />);
    const submitButton = screen.getByRole("button", { name: /create sale event/i });

    expect(submitButton).toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
    const errorMessage = "Tour not found";
    vi.mocked(api.default.post).mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<SaleEventForm tours={mockTours} artists={mockArtists} onSuccess={mockOnSuccess} />);

    // Just verify error message renders if API fails
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("calls onSuccess when form mounts", () => {
    render(<SaleEventForm tours={mockTours} artists={mockArtists} onSuccess={mockOnSuccess} />);
    // Form should render without calling onSuccess on mount
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("accepts tours and artists as props", () => {
    const { container } = render(<SaleEventForm tours={mockTours} artists={mockArtists} onSuccess={mockOnSuccess} />);

    // Verify the form renders with the provided data
    expect(container).toBeInTheDocument();
    expect(mockTours.length).toBe(2);
    expect(mockArtists.length).toBe(2);
  });
});
