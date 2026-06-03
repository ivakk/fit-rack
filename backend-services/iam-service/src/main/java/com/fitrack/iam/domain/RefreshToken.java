package com.fitrack.iam.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    private String id;
    private String userId;
    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean revoked;
}
