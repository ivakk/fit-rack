package com.fitrack.iam.application.port.out;

import com.fitrack.iam.domain.User;

import java.util.Optional;

public interface UserStore {
    Optional<User> findByEmail(String email);
    Optional<User> findById(String id);
    User save(User user);

    void deleteById(String id);
}
