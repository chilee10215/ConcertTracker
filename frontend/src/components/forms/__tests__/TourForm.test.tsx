import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TourForm } from "../TourForm";
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

  it("displays error when required fields are missing", async () => {
    render(<TourForm artists={mockArtists} onSuccess={mockOnSuccess} />);
    const submitButton = screen.getByRole("button", { name: /create tour/i });

    await userEvent.click(submitButton);

    expect(screen.getByText("Artist and tour name are required")).toBeInTheDocument();
  });

  it("successfully creates a tour", async () => {
    vi.mocked(api.default.post).mockResolvedValueOnce({ data: { id: 1 } });

    render(<TourForm artists={mockArtists} onSuccess={mockOnSuccess} />);

    // Select artist
    const artistSelect = screen.getByDisplayValue("Select an artist");
    await userEvent.click(artistSelect);
    const taylorOption = screen.getByRole("option", { name: "Taylor Swift" });
    await userEvent.click(taylorOption);

    // Fill tour name
    const tourNameInput = screen.getByPlaceholderText("e.g., Summer Live 2026");
    await userEvent.type(tourNameInput, "Eras Tour 2026");

    // Fill year
    const yearInput = screen.getByPlaceholderText("2026");
    await userEvent.type(yearInput, "2026");

    // Submit
    const submitButton = screen.getByRole("button", { name: /create tour/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Tour created successfully!")).toBeInTheDocument();
    });

    expect(api.default.post).toHaveBeenCalledWith("/tours", {
      artist_id: 1,
      name: "Eras Tour 2026",
      description: "",
      year: 2026,
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("handles API errors gracefully", async () => {
    const errorMessage = "Artist not found";
    vi.mocked(api.default.post).mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<TourForm artists={mockArtists} onSuccess={mockOnSuccess} />);

    const artistSelect = screen.getByDisplayValue("Select an artist");
    await userEvent.click(artistSelect);
    const taylorOption = screen.getByRole("option", { name: "Taylor Swift" });
    await userEvent.click(taylorOption);

    const tourNameInput = screen.getByPlaceholderText("e.g., Summer Live 2026");
    await userEvent.type(tourNameInput, "Test Tour");

    const submitButton = screen.getByRole("button", { name: /create tour/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
