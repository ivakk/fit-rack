package com.fitrack.workout.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ClockProvider {
    public LocalDateTime now() {
        return LocalDateTime.now();
    }
}
