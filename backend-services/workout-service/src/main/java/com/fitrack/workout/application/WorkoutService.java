package com.fitrack.workout.application;

import com.fitrack.workout.api.dto.CreateWorkoutRequest;
import com.fitrack.workout.api.dto.UpdateWorkoutRequest;
import com.fitrack.workout.api.dto.WorkoutResponse;
import com.fitrack.workout.application.port.in.WorkoutUseCase;
import com.fitrack.workout.application.port.out.WorkoutStore;
import com.fitrack.workout.domain.Exercise;
import com.fitrack.workout.domain.Workout;
import com.fitrack.workout.infrastructure.mapping.WorkoutMapper;
import com.fitrack.workout.util.ClockProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutService implements WorkoutUseCase {

    private final WorkoutStore workoutStore;
    private final WorkoutMapper mapper;
    private final ClockProvider clock;

    @Override
    public WorkoutResponse create(String userId, CreateWorkoutRequest request) {
        var now = clock.now();
        Workout workout = Workout.builder()
                .userId(userId)
                .title(request.getTitle())
                .notes(request.getNotes())
                .performedAt(request.getPerformedAt() != null
                        ? LocalDateTime.ofInstant(request.getPerformedAt(), ZoneOffset.UTC)
                        : now)
                .durationMinutes(request.getDurationMinutes())
                .exercises(mapExercises(request.getExercises()))
                .createdAt(now)
                .updatedAt(now)
                .build();
        return mapper.toResponse(workoutStore.save(workout));
    }

    @Override
    public List<WorkoutResponse> list(String userId) {
        return workoutStore.findAllByUserId(userId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public WorkoutResponse get(String userId, String workoutId) {
        return mapper.toResponse(requireOwned(userId, workoutId));
    }

    @Override
    public WorkoutResponse update(String userId, String workoutId, UpdateWorkoutRequest request) {
        Workout existing = requireOwned(userId, workoutId);

        if (request.getTitle() != null) {
            existing.setTitle(request.getTitle());
        }
        if (request.getNotes() != null) {
            existing.setNotes(request.getNotes());
        }
        if (request.getPerformedAt() != null) {
            existing.setPerformedAt(request.getPerformedAt());
        }
        if (request.getDurationMinutes() != null) {
            existing.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getExercises() != null) {
            existing.setExercises(mapExercises(request.getExercises()));
        }
        existing.setUpdatedAt(clock.now());

        return mapper.toResponse(workoutStore.save(existing));
    }

    @Override
    public void delete(String userId, String workoutId) {
        workoutStore.delete(requireOwned(userId, workoutId));
    }

    private Workout requireOwned(String userId, String workoutId) {
        return workoutStore.findByIdAndUserId(workoutId, userId)
                .orElseThrow(() -> new WorkoutNotFoundException(workoutId));
    }

    private List<Exercise> mapExercises(List<com.fitrack.workout.api.dto.ExerciseRequest> exercises) {
        if (exercises == null) {
            return List.of();
        }
        return exercises.stream()
                .map(e -> Exercise.builder()
                        .name(e.getName())
                        .sets(e.getSets())
                        .reps(e.getReps())
                        .weightKg(e.getWeightKg())
                        .notes(e.getNotes())
                        .build())
                .toList();
    }
}
