package com.fitrack.workout.messaging;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "fitrack.messaging")
public class MessagingProperties {
    private String exchange = "fitrack.events";
    private RoutingKeys routingKeys = new RoutingKeys();
    private Queues queues = new Queues();

    @Data
    public static class RoutingKeys {
        private String userRegistered = "user.registered";
    }

    @Data
    public static class Queues {
        private String userRegistered = "workout-service.user-registered";
    }
}
