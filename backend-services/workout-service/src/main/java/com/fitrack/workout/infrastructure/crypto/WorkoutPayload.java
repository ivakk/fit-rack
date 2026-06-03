package com.fitrack.workout.infrastructure.crypto;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutPayload(
        String title,
        String notes,
        LocalDateTime performedAt,
        Integer durationMinutes,
        List<ExercisePayload> exercises,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record ExercisePayload(
            String name,
            Integer sets,
            Integer reps,
            Double weightKg,
            String notes
    ) {
    }
}
