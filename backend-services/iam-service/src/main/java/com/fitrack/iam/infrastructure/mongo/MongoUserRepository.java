package com.fitrack.iam.infrastructure.mongo;

import com.fitrack.iam.infrastructure.mongo.document.UserDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MongoUserRepository extends MongoRepository<UserDocument, String> {
    Optional<UserDocument> findByEmail(String email);
}
