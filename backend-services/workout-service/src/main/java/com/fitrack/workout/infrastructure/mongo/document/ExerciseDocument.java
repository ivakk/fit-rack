package com.fitrack.workout.infrastructure.mongo.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseDocument {
    private String name;
    private Integer sets;
    private Integer reps;
    private Double weightKg;
    private String notes;
}
