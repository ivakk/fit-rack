package com.fitrack.workout.infrastructure.mapping;

import com.fitrack.workout.api.dto.ExerciseResponse;
import com.fitrack.workout.api.dto.WorkoutResponse;
import com.fitrack.workout.domain.Exercise;
import com.fitrack.workout.domain.Workout;
import com.fitrack.workout.infrastructure.mongo.document.ExerciseDocument;
import com.fitrack.workout.infrastructure.mongo.document.WorkoutDocument;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WorkoutMapper {

    Workout toDomain(WorkoutDocument document);

    WorkoutDocument toDocument(Workout workout);

    Exercise toDomain(ExerciseDocument document);

    ExerciseDocument toDocument(Exercise exercise);

    List<ExerciseDocument> toDocuments(List<Exercise> exercises);

    List<Exercise> toDomainExercises(List<ExerciseDocument> documents);

    ExerciseResponse toResponse(Exercise exercise);

    List<ExerciseResponse> toExerciseResponses(List<Exercise> exercises);

    WorkoutResponse toResponse(Workout workout);
}
