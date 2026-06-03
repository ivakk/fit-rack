package com.fitrack.iam.infrastructure.messaging;

import com.fitrack.iam.application.event.UserRegisteredEvent;
import com.fitrack.iam.application.port.out.DomainEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitDomainEventPublisher implements DomainEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final MessagingProperties messagingProperties;

    @Override
    public void publishUserRegistered(UserRegisteredEvent event) {
        String exchange = messagingProperties.getExchange();
        String routingKey = messagingProperties.getRoutingKeys().getUserRegistered();
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
        log.debug("Published user.registered for userId={}", event.userId());
    }
}
