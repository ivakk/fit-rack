package com.fitrack.workout.infrastructure.mapping;

import com.fitrack.workout.api.dto.ExerciseResponse;
import com.fitrack.workout.api.dto.WorkoutResponse;
import com.fitrack.workout.domain.Exercise;
import com.fitrack.workout.domain.Workout;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class WorkoutMapper {

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

    public List<ExerciseResponse> toExerciseResponses(List<Exercise> exercises) {
        if (exercises == null) {
            return Collections.emptyList();
        }
        return exercises.stream().map(this::toResponse).toList();
    }

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
}
