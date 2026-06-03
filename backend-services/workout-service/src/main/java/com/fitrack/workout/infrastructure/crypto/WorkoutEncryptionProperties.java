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

    @NotBlank
    @Size(min = 32, message = "fitrack.encryption.workout-key must be at least 32 characters")
    private String workoutKey;
}
