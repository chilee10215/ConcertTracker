import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { SignupPage } from "@/pages/SignupPage";

const mockSignup = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ signup: mockSignup }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderSignupPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  );
}

describe("SignupPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders email, password, confirm password fields and create button", () => {
    renderSignupPage();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    renderSignupPage();

    await userEvent.type(screen.getByLabelText(/^email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "different");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("shows error when password is shorter than 6 characters", async () => {
    renderSignupPage();

    await userEvent.type(screen.getByLabelText(/^email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "abc");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "abc");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("calls signup and navigates to home on success", async () => {
    mockSignup.mockResolvedValueOnce(undefined);
    renderSignupPage();

    await userEvent.type(screen.getByLabelText(/^email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith("user@example.com", "password123");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("displays backend error detail on signup failure", async () => {
    mockSignup.mockRejectedValueOnce({
      response: { data: { detail: "Email already registered" } },
    });
    renderSignupPage();

    await userEvent.type(screen.getByLabelText(/^email/i), "existing@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(screen.getByText("Email already registered")).toBeInTheDocument()
    );
  });

  it("shows creating account text while loading", async () => {
    mockSignup.mockImplementation(() => new Promise(() => {}));
    renderSignupPage();

    await userEvent.type(screen.getByLabelText(/^email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
  });

  it("has a link to the login page", () => {
    renderSignupPage();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });
});
