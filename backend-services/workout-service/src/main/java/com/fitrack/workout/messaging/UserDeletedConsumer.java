package com.fitrack.workout.messaging;

import com.fitrack.workout.application.port.out.WorkoutStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserDeletedConsumer {

    private final WorkoutStore workoutStore;

    @RabbitListener(queues = "${fitrack.messaging.queues.user-deleted}")
    public void onUserDeleted(UserDeletedMessage message) {
        if (message.userId() == null || message.userId().isBlank()) {
            log.warn("Ignoring user.deleted with missing userId");
            return;
        }
        workoutStore.deleteAllByUserId(message.userId());
        log.info("Purged workouts for deleted userId={}", message.userId());
    }
}
