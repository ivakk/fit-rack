package com.fitrack.workout.infrastructure.mongo;

import com.fitrack.workout.application.port.out.WorkoutStore;
import com.fitrack.workout.domain.Workout;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MongoWorkoutStore implements WorkoutStore {

    private final MongoWorkoutRepository repository;
    private final EncryptedWorkoutMapper encryptedMapper;

    @Override
    public Workout save(Workout workout) {
        return encryptedMapper.toDomain(repository.save(encryptedMapper.toDocument(workout)));
    }

    @Override
    public Optional<Workout> findById(String id) {
        return repository.findById(id).map(encryptedMapper::toDomain);
    }

    @Override
    public Optional<Workout> findByIdAndUserId(String id, String userId) {
        return repository.findByIdAndUserId(id, userId).map(encryptedMapper::toDomain);
    }

    @Override
    public List<Workout> findAllByUserId(String userId) {
        return repository.findAllByUserId(userId).stream()
                .map(encryptedMapper::toDomain)
                .sorted(Comparator.comparing(
                        Workout::getPerformedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();
    }

    @Override
    public void delete(Workout workout) {
        repository.delete(encryptedMapper.toDocument(workout));
    }
}
