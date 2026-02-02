import { render, screen } from "@testing-library/react";
import App from "./App";
import { describe, it, expect, vi } from "vitest";

// Mock the API hooks
vi.mock("@/hooks/useDashboardData", () => ({
  useRawHouseholds: () => ({ data: [], isLoading: false }),
  useRawOfficers: () => ({ data: [], isLoading: false }),
  useRawTeams: () => ({ data: [], isLoading: false }),
  useDataQuality: () => ({ data: { issues: [], stats: {} }, isLoading: false }),
  useBankSummary: () => ({ data: {}, isLoading: false }),
}));

// Mock ResizeObserver which is often needed for chart libraries
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

describe("App", () => {
  it("renders the dashboard title", () => {
    render(<App />);
    expect(screen.getByText("Oxford Nexus")).toBeInTheDocument();
  });
});
