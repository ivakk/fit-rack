package com.fitrack.workout.messaging;

import java.time.Instant;

/**
 * Inbound copy of contracts/asyncapi/user-events.asyncapi.yaml (UserRegisteredPayload).
 * Kept in workout-service only — no dependency on IAM.
 */
public record UserRegisteredMessage(
        String userId,
        String email,
        String fullName,
        String role,
        Instant occurredAt
) {
}
