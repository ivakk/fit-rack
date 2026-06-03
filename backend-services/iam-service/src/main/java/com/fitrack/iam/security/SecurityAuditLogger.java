package com.fitrack.iam.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SecurityAuditLogger {

    public void authFailure(String event, String emailOrUser) {
        log.warn("SECURITY event={} subject={}", event, mask(emailOrUser));
    }

    private static String mask(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }
        int at = value.indexOf('@');
        if (at > 1) {
            return value.charAt(0) + "***" + value.substring(at);
        }
        return value.length() <= 4 ? "***" : value.substring(0, 2) + "***";
    }
}
