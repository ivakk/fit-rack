package com.fitrack.workout.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {
    private String name;
    private Integer sets;
    private Integer reps;
    private Double weightKg;
    private String notes;
}
