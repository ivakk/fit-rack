package com.fitrack.workout.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workout {
    private String id;
    private String userId;
    private String title;
    private String notes;
    private LocalDateTime performedAt;
    private Integer durationMinutes;
    @Builder.Default
    private List<Exercise> exercises = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
