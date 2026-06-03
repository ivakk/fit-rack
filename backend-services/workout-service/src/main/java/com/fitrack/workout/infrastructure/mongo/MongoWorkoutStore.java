package com.fitrack.workout.infrastructure.mongo;

import com.fitrack.workout.application.port.out.WorkoutStore;
import com.fitrack.workout.domain.Workout;
import com.fitrack.workout.infrastructure.mapping.WorkoutMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MongoWorkoutStore implements WorkoutStore {

    private final MongoWorkoutRepository repository;
    private final WorkoutMapper mapper;

    @Override
    public Workout save(Workout workout) {
        return mapper.toDomain(repository.save(mapper.toDocument(workout)));
    }

    @Override
    public Optional<Workout> findById(String id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Workout> findByIdAndUserId(String id, String userId) {
        return repository.findByIdAndUserId(id, userId).map(mapper::toDomain);
    }

    @Override
    public List<Workout> findAllByUserId(String userId) {
        return repository.findAllByUserIdOrderByPerformedAtDesc(userId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void delete(Workout workout) {
        repository.delete(mapper.toDocument(workout));
    }
}
