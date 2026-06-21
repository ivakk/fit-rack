package com.fitrack.iam.application.port.out;

import com.fitrack.iam.application.event.UserDeletedEvent;
import com.fitrack.iam.application.event.UserRegisteredEvent;

public interface DomainEventPublisher {
    void publishUserRegistered(UserRegisteredEvent event);

    void publishUserDeleted(UserDeletedEvent event);
}
