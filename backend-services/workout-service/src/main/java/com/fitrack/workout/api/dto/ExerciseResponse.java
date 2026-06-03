package com.fitrack.workout.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseResponse {
    private String name;
    private Integer sets;
    private Integer reps;
    private Double weightKg;
    private String notes;
}
