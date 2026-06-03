package com.fitrack.workout.web;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "fitrack.gateway")
public class GatewayIdentityProperties {

    /** Header set by IAM via Traefik ForwardAuth (not accepted from clients). */
    private String userIdHeader = "X-Internal-User-Id";

    /** Header set only by Traefik after successful ForwardAuth. */
    private String trustedHeader = "X-Gateway-Trusted";

    private String trustedSecret = "fitrack-dev-gateway";

    /** When true, reject requests without gateway trust (Docker / production). */
    private boolean requireTrustedHeader = false;

    /** Legacy header clients must not send when requireTrustedHeader is true. */
    private String forbiddenClientHeader = "X-User-Id";
}
