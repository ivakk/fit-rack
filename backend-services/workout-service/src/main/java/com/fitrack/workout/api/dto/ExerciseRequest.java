package com.fitrack.workout.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ExerciseRequest {
    @NotBlank
    @Size(max = 200)
    private String name;

    @Min(0)
    @Max(999)
    private Integer sets;

    @Min(0)
    @Max(9999)
    private Integer reps;

    @Min(0)
    @Max(9999)
    private Double weightKg;

    @Size(max = 500)
    private String notes;
}
