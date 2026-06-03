package com.fitrack.iam.infrastructure.messaging;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "fitrack.messaging")
public class MessagingProperties {
    private String exchange = "fitrack.events";
    private RoutingKeys routingKeys = new RoutingKeys();

    @Data
    public static class RoutingKeys {
        private String userRegistered = "user.registered";
        private String userDeleted = "user.deleted";
    }
}
