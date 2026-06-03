package com.fitrack.workout.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExerciseRequest {
    @NotBlank
    private String name;
    private Integer sets;
    private Integer reps;
    private Double weightKg;
    private String notes;
}
