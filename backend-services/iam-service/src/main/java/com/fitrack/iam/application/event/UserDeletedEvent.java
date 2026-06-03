package com.fitrack.iam.application.event;

import java.time.Instant;

public record UserDeletedEvent(String userId, Instant occurredAt) {
}
