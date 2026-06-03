import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MockLink from "@/test/mocks/next-link";
import { WorkoutCard } from "./WorkoutCard";

vi.mock("next/link", () => ({ default: MockLink }));

describe("WorkoutCard", () => {
  it("links to workout detail and shows exercise count", () => {
    render(
      <WorkoutCard
        workout={{
          id: "w-1",
          userId: "u-1",
          title: "Leg day",
          exercises: [{ name: "Squat" }, { name: "Lunge" }],
          createdAt: "2026-01-15T10:00:00Z",
        }}
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/workouts/w-1");
    expect(screen.getByText("Leg day")).toBeInTheDocument();
    expect(screen.getByText("2 exercises")).toBeInTheDocument();
  });
});
