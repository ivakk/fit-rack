package com.fitrack.iam.infrastructure.mongo;

import com.fitrack.iam.infrastructure.mongo.document.RefreshTokenDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MongoRefreshTokenRepository extends MongoRepository<RefreshTokenDocument, String> {
    Optional<RefreshTokenDocument> findByTokenAndRevokedFalse(String token);
}
