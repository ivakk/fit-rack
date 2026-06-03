import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MockLink from "@/test/mocks/next-link";
import { WorkoutList } from "./WorkoutList";

vi.mock("next/link", () => ({ default: MockLink }));

describe("WorkoutList", () => {
  it("shows loading state", () => {
    render(<WorkoutList workouts={[]} loading error={null} />);
    expect(screen.getByText("Loading workouts…")).toBeInTheDocument();
  });

  it("shows error alert", () => {
    render(<WorkoutList workouts={[]} loading={false} error="Network down" />);
    expect(screen.getByText("Network down")).toBeInTheDocument();
  });

  it("shows empty state CTA", () => {
    render(<WorkoutList workouts={[]} loading={false} error={null} />);
    expect(screen.getByText("Your training log is empty.")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/workouts/new");
  });
});
