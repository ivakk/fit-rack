package com.fitrack.iam.infrastructure.mongo;

import com.fitrack.iam.application.port.out.RefreshTokenStore;
import com.fitrack.iam.domain.RefreshToken;
import com.fitrack.iam.infrastructure.mapping.RefreshTokenMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MongoRefreshTokenStore implements RefreshTokenStore {

    private final MongoRefreshTokenRepository repository;
    private final RefreshTokenMapper mapper;

    @Override
    public RefreshToken save(RefreshToken token) {
        var saved = repository.save(mapper.toDocument(token));
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<RefreshToken> findActiveByToken(String token) {
        return repository.findByTokenAndRevokedFalse(token).map(mapper::toDomain);
    }

    @Override
    public void revoke(RefreshToken token) {
        token.setRevoked(true);
        repository.save(mapper.toDocument(token));
    }
}
