package com.fitrack.iam.application.port.out;

import com.fitrack.iam.domain.RefreshToken;

import java.util.Optional;

public interface RefreshTokenStore {
    RefreshToken save(RefreshToken token);
    Optional<RefreshToken> findActiveByToken(String token);
    void revoke(RefreshToken token);

    void deleteAllByUserId(String userId);
}
