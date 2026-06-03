package com.fitrack.workout.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateWorkoutRequest {
    @NotBlank
    private String title;

    private String notes;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant performedAt;
    private Integer durationMinutes;

    @Valid
    private List<ExerciseRequest> exercises = new ArrayList<>();
}
