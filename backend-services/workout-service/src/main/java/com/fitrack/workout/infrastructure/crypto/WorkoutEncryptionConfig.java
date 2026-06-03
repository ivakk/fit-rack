package com.fitrack.workout.infrastructure.crypto;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(WorkoutEncryptionProperties.class)
public class WorkoutEncryptionConfig {
}
