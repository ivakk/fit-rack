package com.fitrack.workout.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Reacts to IAM user registration without calling IAM over HTTP.
 * Extend later (e.g. seed default workout templates per user).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserRegisteredConsumer {

    @RabbitListener(queues = "${fitrack.messaging.queues.user-registered}")
    public void onUserRegistered(UserRegisteredMessage message) {
        log.info(
                "Received user.registered: userId={} email={} role={}",
                message.userId(),
                message.email(),
                message.role()
        );
    }
}
