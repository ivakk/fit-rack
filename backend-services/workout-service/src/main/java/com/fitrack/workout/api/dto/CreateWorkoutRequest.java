package com.fitrack.workout.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateWorkoutRequest {
    @NotBlank
    private String title;

    private String notes;
    private LocalDateTime performedAt;
    private Integer durationMinutes;

    @Valid
    private List<ExerciseRequest> exercises = new ArrayList<>();
}
