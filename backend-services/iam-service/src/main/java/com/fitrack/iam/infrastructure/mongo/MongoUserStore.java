package com.fitrack.iam.infrastructure.mongo;

import com.fitrack.iam.application.port.out.UserStore;
import com.fitrack.iam.domain.User;
import com.fitrack.iam.infrastructure.mapping.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MongoUserStore implements UserStore {

    private final MongoUserRepository repository;
    private final UserMapper mapper;

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email).map(mapper::toDomain);
    }

    @Override
    public Optional<User> findById(String id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public User save(User user) {
        var saved = repository.save(mapper.toDocument(user));
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
