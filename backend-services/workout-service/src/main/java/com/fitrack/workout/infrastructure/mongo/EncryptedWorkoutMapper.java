package com.fitrack.workout.infrastructure.mongo;

import com.fitrack.workout.domain.Exercise;
import com.fitrack.workout.domain.Workout;
import com.fitrack.workout.infrastructure.crypto.WorkoutEncryptionService;
import com.fitrack.workout.infrastructure.crypto.WorkoutPayload;
import com.fitrack.workout.infrastructure.crypto.WorkoutPayload.ExercisePayload;
import com.fitrack.workout.infrastructure.mongo.document.WorkoutDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EncryptedWorkoutMapper {

    private final WorkoutEncryptionService encryption;

    public WorkoutDocument toDocument(Workout workout) {
        if (workout == null) {
            return null;
        }
        WorkoutPayload payload = new WorkoutPayload(
                workout.getTitle(),
                workout.getNotes(),
                workout.getPerformedAt(),
                workout.getDurationMinutes(),
                toExercisePayloads(workout.getExercises()),
                workout.getCreatedAt(),
                workout.getUpdatedAt()
        );
        var blob = encryption.encrypt(payload);
        return WorkoutDocument.builder()
                .id(workout.getId())
                .userId(workout.getUserId())
                .encryptionVersion(blob.version())
                .iv(blob.ivBase64())
                .ciphertext(blob.ciphertextBase64())
                .build();
    }

    public Workout toDomain(WorkoutDocument document) {
        if (document == null) {
            return null;
        }
        if (document.getCiphertext() == null || document.getCiphertext().isBlank()) {
            return legacyPlaintext(document);
        }
        WorkoutPayload payload = encryption.decrypt(new WorkoutEncryptionService.EncryptedBlob(
                document.getEncryptionVersion(),
                document.getIv(),
                document.getCiphertext()
        ));
        return Workout.builder()
                .id(document.getId())
                .userId(document.getUserId())
                .title(payload.title())
                .notes(payload.notes())
                .performedAt(payload.performedAt())
                .durationMinutes(payload.durationMinutes())
                .exercises(fromExercisePayloads(payload.exercises()))
                .createdAt(payload.createdAt())
                .updatedAt(payload.updatedAt())
                .build();
    }

    private static List<ExercisePayload> toExercisePayloads(List<Exercise> exercises) {
        if (exercises == null) {
            return List.of();
        }
        return exercises.stream()
                .map(e -> new ExercisePayload(e.getName(), e.getSets(), e.getReps(), e.getWeightKg(), e.getNotes()))
                .toList();
    }

    private static List<Exercise> fromExercisePayloads(List<ExercisePayload> exercises) {
        if (exercises == null) {
            return List.of();
        }
        return exercises.stream()
                .map(e -> Exercise.builder()
                        .name(e.name())
                        .sets(e.sets())
                        .reps(e.reps())
                        .weightKg(e.weightKg())
                        .notes(e.notes())
                        .build())
                .toList();
    }

    private Workout legacyPlaintext(WorkoutDocument document) {
        return Workout.builder()
                .id(document.getId())
                .userId(document.getUserId())
                .title(document.getTitle())
                .notes(document.getNotes())
                .performedAt(document.getPerformedAt())
                .durationMinutes(document.getDurationMinutes())
                .exercises(document.getExercises() == null
                        ? List.of()
                        : document.getExercises().stream()
                        .map(e -> Exercise.builder()
                                .name(e.getName())
                                .sets(e.getSets())
                                .reps(e.getReps())
                                .weightKg(e.getWeightKg())
                                .notes(e.getNotes())
                                .build())
                        .toList())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}
