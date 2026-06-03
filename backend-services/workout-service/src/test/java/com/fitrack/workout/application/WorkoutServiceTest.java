package com.fitrack.workout.application;

import com.fitrack.workout.api.dto.CreateWorkoutRequest;
import com.fitrack.workout.api.dto.ExerciseRequest;
import com.fitrack.workout.api.dto.UpdateWorkoutRequest;
import com.fitrack.workout.api.dto.WorkoutResponse;
import com.fitrack.workout.domain.Exercise;
import com.fitrack.workout.application.port.out.WorkoutStore;
import com.fitrack.workout.domain.Workout;
import com.fitrack.workout.infrastructure.mapping.WorkoutMapper;
import com.fitrack.workout.util.ClockProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkoutServiceTest {

    @Mock
    WorkoutStore workoutStore;
    @Mock
    WorkoutMapper mapper;
    @Mock
    ClockProvider clock;

    @InjectMocks
    WorkoutService workoutService;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 6, 3, 14, 0);

    @Test
    void create_savesWorkoutForUser() {
        when(clock.now()).thenReturn(NOW);

        Workout saved = Workout.builder().id("w1").userId("u1").title("Leg day").build();
        WorkoutResponse response = new WorkoutResponse("w1", "u1", "Leg day", null, NOW, null, List.of(), NOW, NOW);

        when(workoutStore.save(any(Workout.class))).thenReturn(saved);
        when(mapper.toResponse(saved)).thenReturn(response);

        CreateWorkoutRequest req = new CreateWorkoutRequest();
        req.setTitle("Leg day");

        WorkoutResponse result = workoutService.create("u1", req);

        assertThat(result.getTitle()).isEqualTo("Leg day");
        verify(workoutStore).save(any(Workout.class));
    }

    @Test
    void update_canRemoveExercises() {
        when(clock.now()).thenReturn(NOW);

        Workout existing = Workout.builder()
                .id("w1")
                .userId("u1")
                .title("Leg day")
                .exercises(List.of(
                        Exercise.builder().name("Squat").sets(4).build(),
                        Exercise.builder().name("Lunge").sets(3).build()
                ))
                .build();

        when(workoutStore.findByIdAndUserId("w1", "u1")).thenReturn(Optional.of(existing));
        when(workoutStore.save(any(Workout.class))).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(Workout.class))).thenAnswer(inv -> {
            Workout w = inv.getArgument(0);
            return new WorkoutResponse("w1", "u1", "Leg day", null, NOW, null, List.of(), NOW, NOW);
        });

        UpdateWorkoutRequest req = new UpdateWorkoutRequest();
        ExerciseRequest kept = new ExerciseRequest();
        kept.setName("Lunge");
        kept.setSets(3);
        req.setExercises(List.of(kept));

        workoutService.update("u1", "w1", req);

        assertThat(existing.getExercises()).hasSize(1);
        assertThat(existing.getExercises().getFirst().getName()).isEqualTo("Lunge");
        verify(workoutStore).save(existing);
    }

    @Test
    void get_throwsWhenNotOwned() {
        when(workoutStore.findByIdAndUserId("w1", "u1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> workoutService.get("u1", "w1"))
                .isInstanceOf(WorkoutNotFoundException.class);
    }
}
