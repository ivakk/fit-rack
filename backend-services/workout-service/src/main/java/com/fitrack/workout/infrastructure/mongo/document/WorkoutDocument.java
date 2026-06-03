package com.fitrack.workout.infrastructure.mongo.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "workouts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutDocument {

    @Id
    private String id;

    /** Plaintext for per-user queries; all other workout fields live in {@link #ciphertext}. */
    @Indexed
    private String userId;

    private int encryptionVersion = 1;
    private String iv;
    private String ciphertext;

    // Legacy plaintext fields (read-only); not written for new records.
    private String title;
    private String notes;
    private LocalDateTime performedAt;
    private Integer durationMinutes;
    @Builder.Default
    private List<ExerciseDocument> exercises = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
