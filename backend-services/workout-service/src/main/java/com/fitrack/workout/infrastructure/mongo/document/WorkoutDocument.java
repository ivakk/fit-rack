package com.fitrack.workout.infrastructure.mongo.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "workouts")
@CompoundIndex(name = "user_performed", def = "{'userId': 1, 'performedAt': -1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String notes;
    private LocalDateTime performedAt;
    private Integer durationMinutes;

    @Builder.Default
    private List<ExerciseDocument> exercises = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
