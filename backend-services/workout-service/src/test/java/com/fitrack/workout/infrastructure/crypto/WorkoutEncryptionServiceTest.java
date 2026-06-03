package com.fitrack.workout.infrastructure.crypto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitrack.workout.infrastructure.crypto.WorkoutPayload.ExercisePayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class WorkoutEncryptionServiceTest {

    private WorkoutEncryptionService encryption;

    @BeforeEach
    void setUp() {
        WorkoutEncryptionProperties props = new WorkoutEncryptionProperties();
        props.setWorkoutKey("test-workout-encryption-key-32-chars-min");
        encryption = new WorkoutEncryptionService(props, new ObjectMapper().findAndRegisterModules());
    }

    @Test
    void roundTripPreservesPayload() {
        WorkoutPayload original = new WorkoutPayload(
                "Leg day",
                "Felt strong",
                LocalDateTime.of(2026, 6, 3, 10, 0),
                45,
                List.of(new ExercisePayload("Squat", 4, 8, 80.0, null)),
                LocalDateTime.of(2026, 6, 3, 10, 5),
                LocalDateTime.of(2026, 6, 3, 10, 5)
        );

        var blob = encryption.encrypt(original);
        assertThat(blob.ciphertextBase64()).isNotBlank();
        assertThat(blob.ivBase64()).isNotBlank();

        WorkoutPayload decrypted = encryption.decrypt(blob);
        assertThat(decrypted).isEqualTo(original);
    }
}
