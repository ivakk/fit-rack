package com.fitrack.workout.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdateWorkoutRequest {
    @Size(max = 200)
    private String title;

    @Size(max = 4000)
    private String notes;
    private LocalDateTime performedAt;

    @Min(1)
    @Max(1440)
    private Integer durationMinutes;

    @Valid
    @Size(max = 100)
    private List<ExerciseRequest> exercises;
}
