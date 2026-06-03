package com.fitrack.workout.messaging;

import java.time.Instant;

/**
 * Inbound copy of contracts/asyncapi/user-events.asyncapi.yaml (UserDeletedPayload).
 */
public record UserDeletedMessage(String userId, Instant occurredAt) {
}
