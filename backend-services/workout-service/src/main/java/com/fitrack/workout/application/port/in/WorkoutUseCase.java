package com.fitrack.workout.application.port.in;

import com.fitrack.workout.api.dto.CreateWorkoutRequest;
import com.fitrack.workout.api.dto.UpdateWorkoutRequest;
import com.fitrack.workout.api.dto.WorkoutResponse;

import java.util.List;

public interface WorkoutUseCase {
    WorkoutResponse create(String userId, CreateWorkoutRequest request);
    List<WorkoutResponse> list(String userId);
    WorkoutResponse get(String userId, String workoutId);
    WorkoutResponse update(String userId, String workoutId, UpdateWorkoutRequest request);
    void delete(String userId, String workoutId);
}
