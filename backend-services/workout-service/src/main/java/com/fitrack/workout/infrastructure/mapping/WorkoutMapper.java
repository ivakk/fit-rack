package com.fitrack.workout.infrastructure.mapping;

import com.fitrack.workout.api.dto.ExerciseResponse;
import com.fitrack.workout.api.dto.WorkoutResponse;
import com.fitrack.workout.domain.Exercise;
import com.fitrack.workout.domain.Workout;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WorkoutMapper {

    public WorkoutResponse toResponse(Workout workout) {
        if (workout == null) {
            return null;
        }
        return new WorkoutResponse(
                workout.getId(),
                workout.getUserId(),
                workout.getTitle(),
                workout.getNotes(),
                workout.getPerformedAt(),
                workout.getDurationMinutes(),
                toExerciseResponses(workout.getExercises()),
                workout.getCreatedAt(),
                workout.getUpdatedAt()
        );
    }

    public List<ExerciseResponse> toExerciseResponses(List<Exercise> exercises) {
        if (exercises == null || exercises.isEmpty()) {
            return List.of();
        }
        return exercises.stream().map(this::toResponse).toList();
    }

    public ExerciseResponse toResponse(Exercise exercise) {
        if (exercise == null) {
            return null;
        }
        return new ExerciseResponse(
                exercise.getName(),
                exercise.getSets(),
                exercise.getReps(),
                exercise.getWeightKg(),
                exercise.getNotes()
        );
    }
}
