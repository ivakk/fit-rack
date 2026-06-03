package com.fitrack.workout.infrastructure.crypto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@ConfigurationProperties(prefix = "fitrack.encryption")
public class WorkoutEncryptionProperties {

    /**
     * AES-256 key material (UTF-8). Must be at least 32 characters in production.
     */
    @NotBlank
    @Size(min = 32, message = "fitrack.encryption.workout-key must be at least 32 characters")
    private String workoutKey;
}
