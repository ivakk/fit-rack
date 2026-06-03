package com.fitrack.workout.infrastructure.mongo;

import com.fitrack.workout.infrastructure.mongo.document.WorkoutDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MongoWorkoutRepository extends MongoRepository<WorkoutDocument, String> {
    List<WorkoutDocument> findAllByUserId(String userId);

    Optional<WorkoutDocument> findByIdAndUserId(String id, String userId);

    void deleteAllByUserId(String userId);
}
