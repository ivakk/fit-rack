package com.fitrack.workout.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutResponse {
    private String id;
    private String userId;
    private String title;
    private String notes;
    private LocalDateTime performedAt;
    private Integer durationMinutes;
    private List<ExerciseResponse> exercises;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
