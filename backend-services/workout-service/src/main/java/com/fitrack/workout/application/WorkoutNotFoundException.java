package com.fitrack.workout.application;

public class WorkoutNotFoundException extends RuntimeException {
    public WorkoutNotFoundException(String workoutId) {
        super("Workout not found: " + workoutId);
    }
}
