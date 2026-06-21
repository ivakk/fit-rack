package com.fitrack.workout.application.port.out;

import com.fitrack.workout.domain.Workout;

import java.util.List;
import java.util.Optional;

public interface WorkoutStore {
    Workout save(Workout workout);
    Optional<Workout> findById(String id);
    Optional<Workout> findByIdAndUserId(String id, String userId);
    List<Workout> findAllByUserId(String userId);
    void delete(Workout workout);

    void deleteAllByUserId(String userId);
}
