package com.fitrack.workout.messaging;

import com.fitrack.workout.application.port.out.WorkoutStore;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserDeletedConsumerTest {

    @Mock
    WorkoutStore workoutStore;

    @InjectMocks
    UserDeletedConsumer consumer;

    @Test
    void onUserDeleted_purgesWorkouts() {
        consumer.onUserDeleted(new UserDeletedMessage("user-42", Instant.parse("2026-06-03T12:00:00Z")));

        verify(workoutStore).deleteAllByUserId("user-42");
    }

    @Test
    void onUserDeleted_ignoresBlankUserId() {
        consumer.onUserDeleted(new UserDeletedMessage("  ", Instant.now()));

        verify(workoutStore, never()).deleteAllByUserId(org.mockito.ArgumentMatchers.anyString());
    }
}
