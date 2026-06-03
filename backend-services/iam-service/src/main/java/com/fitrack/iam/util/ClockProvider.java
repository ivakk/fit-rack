package com.fitrack.iam.util;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class ClockProvider {
    public LocalDateTime now() {
        return LocalDateTime.now();
    }
}
