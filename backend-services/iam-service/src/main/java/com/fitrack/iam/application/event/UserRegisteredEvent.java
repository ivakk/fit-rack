package com.fitrack.iam.application.event;

import java.time.Instant;

/**
 * Contract: contracts/asyncapi/user-events.asyncapi.yaml (UserRegisteredPayload)
 */
public record UserRegisteredEvent(
        String userId,
        String email,
        String fullName,
        String role,
        Instant occurredAt
) {
}
