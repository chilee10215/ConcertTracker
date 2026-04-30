import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from "@/lib/api";

const mockApi = api as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("starts with null user when no token in localStorage", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});
    expect(result.current.user).toBeNull();
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it("fetches user on mount when token exists in localStorage", async () => {
    localStorage.setItem("token", "valid-token");
    mockApi.get.mockResolvedValueOnce({ data: { id: 1, email: "test@example.com", username: "tester" } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(mockApi.get).toHaveBeenCalledWith("/auth/me");
    expect(result.current.user?.email).toBe("test@example.com");
  });

  it("stores token and sets it in state after login", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { access_token: "new-token" } });
    mockApi.get.mockResolvedValueOnce({ data: { id: 1, email: "test@example.com" } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    expect(localStorage.getItem("token")).toBe("new-token");
    expect(result.current.token).toBe("new-token");
  });

  it("stores token in localStorage after signup", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { access_token: "signup-token" } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup("new@example.com", "password123");
    });

    expect(localStorage.getItem("token")).toBe("signup-token");
  });

  it("clears token and user on logout", async () => {
    localStorage.setItem("token", "existing-token");
    mockApi.get.mockResolvedValueOnce({ data: { id: 1, email: "test@example.com" } });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    act(() => result.current.logout());

    expect(localStorage.getItem("token")).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("clears token when /auth/me returns an error", async () => {
    localStorage.setItem("token", "expired-token");
    mockApi.get.mockRejectedValueOnce(new Error("Unauthorized"));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    expect(localStorage.getItem("token")).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
