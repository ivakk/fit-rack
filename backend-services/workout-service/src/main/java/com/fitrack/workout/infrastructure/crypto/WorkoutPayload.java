package com.fitrack.workout.infrastructure.crypto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Serializable workout fields stored inside the encrypted blob.
 * {@code id} and {@code userId} stay outside the ciphertext for access control and lookups.
 */
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
