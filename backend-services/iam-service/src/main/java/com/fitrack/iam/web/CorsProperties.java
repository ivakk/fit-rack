package com.fitrack.iam.web;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;


public class CorsProperties {
    /**
     * Allowed origins, e.g. http://localhost:5173, https://app.fitrack.com
     */
    private List<String> allowedOrigins = List.of("*");

    /**
     * Allowed methods, default common verbs.
     */
    private List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "OPTIONS");

    /**
     * Allowed headers.
     */
    private List<String> allowedHeaders = List.of("*");

    /**
     * Whether to include credentials.
     */
    private boolean allowCredentials = true;

    public List<String> getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    public List<String> getAllowedMethods() { return allowedMethods; }
    public void setAllowedMethods(List<String> allowedMethods) { this.allowedMethods = allowedMethods; }
    public List<String> getAllowedHeaders() { return allowedHeaders; }
    public void setAllowedHeaders(List<String> allowedHeaders) { this.allowedHeaders = allowedHeaders; }
    public boolean isAllowCredentials() { return allowCredentials; }
    public void setAllowCredentials(boolean allowCredentials) { this.allowCredentials = allowCredentials; }
}
