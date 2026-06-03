package com.fitrack.workout.api.dto;

import jakarta.validation.Valid;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdateWorkoutRequest {
    private String title;
    private String notes;
    private LocalDateTime performedAt;
    private Integer durationMinutes;

    @Valid
    private List<ExerciseRequest> exercises;
}
