package com.fitrack.iam.infrastructure.mapping;

import com.fitrack.iam.domain.RefreshToken;
import com.fitrack.iam.infrastructure.mongo.document.RefreshTokenDocument;
import org.springframework.stereotype.Component;

@Component
public class RefreshTokenMapper {

    public RefreshToken toDomain(RefreshTokenDocument document) {
        if (document == null) {
            return null;
        }
        return RefreshToken.builder()
                .id(document.getId())
                .userId(document.getUserId())
                .token(document.getToken())
                .createdAt(document.getCreatedAt())
                .expiresAt(document.getExpiresAt())
                .revoked(document.isRevoked())
                .build();
    }

    public RefreshTokenDocument toDocument(RefreshToken token) {
        if (token == null) {
            return null;
        }
        return RefreshTokenDocument.builder()
                .id(token.getId())
                .userId(token.getUserId())
                .token(token.getToken())
                .createdAt(token.getCreatedAt())
                .expiresAt(token.getExpiresAt())
                .revoked(token.isRevoked())
                .build();
    }
}
