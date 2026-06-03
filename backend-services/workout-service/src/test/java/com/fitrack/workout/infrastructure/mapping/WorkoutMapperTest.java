package com.fitrack.workout.infrastructure.mapping;

import com.fitrack.workout.domain.Exercise;
import com.fitrack.workout.domain.Workout;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class WorkoutMapperTest {

    private final WorkoutMapper mapper = new WorkoutMapper();

    @Test
    void toResponse_mapsExercises() {
        Workout workout = Workout.builder()
                .id("w1")
                .userId("u1")
                .title("Leg day")
                .exercises(List.of(
                        Exercise.builder()
                                .name("Squat")
                                .sets(4)
                                .reps(8)
                                .weightKg(80.0)
                                .build()
                ))
                .performedAt(LocalDateTime.of(2026, 6, 3, 10, 0))
                .createdAt(LocalDateTime.of(2026, 6, 3, 10, 0))
                .updatedAt(LocalDateTime.of(2026, 6, 3, 10, 0))
                .build();

        var response = mapper.toResponse(workout);

        assertThat(response.getId()).isEqualTo("w1");
        assertThat(response.getTitle()).isEqualTo("Leg day");
        assertThat(response.getExercises()).hasSize(1);
        assertThat(response.getExercises().getFirst().getName()).isEqualTo("Squat");
        assertThat(response.getExercises().getFirst().getSets()).isEqualTo(4);
        assertThat(response.getExercises().getFirst().getWeightKg()).isEqualTo(80.0);
    }
}
