import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorkoutExerciseList } from "./WorkoutExerciseList";

vi.mock("@/lib/auth-storage", () => ({
  getAccessToken: () => "token",
}));

vi.mock("@/lib/api", () => ({
  workoutApi: {
    update: vi.fn(),
  },
  ApiError: class ApiError extends Error {},
}));

import { workoutApi } from "@/lib/api";

const workout = {
  id: "w1",
  userId: "u1",
  title: "Leg day",
  exercises: [
    { name: "Squat", sets: 4, reps: 8, weightKg: 80 },
    { name: "Lunge", sets: 3, reps: 10 },
  ],
};

describe("WorkoutExerciseList", () => {
  beforeEach(() => {
    vi.mocked(workoutApi.update).mockReset();
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("removes an exercise via PUT with updated list", async () => {
    const onUpdated = vi.fn();
    vi.mocked(workoutApi.update).mockResolvedValue({
      ...workout,
      exercises: [{ name: "Lunge", sets: 3, reps: 10 }],
    });

    render(<WorkoutExerciseList workout={workout} onUpdated={onUpdated} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    await waitFor(() => {
      expect(workoutApi.update).toHaveBeenCalledWith("token", "w1", {
        exercises: [{ name: "Lunge", sets: 3, reps: 10 }],
      });
      expect(onUpdated).toHaveBeenCalled();
    });
  });
});
