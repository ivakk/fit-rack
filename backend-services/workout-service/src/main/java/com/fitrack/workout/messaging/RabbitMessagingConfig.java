package com.fitrack.workout.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MessagingProperties.class)
public class RabbitMessagingConfig {

    @Bean
    TopicExchange fitrackEventsExchange(MessagingProperties properties) {
        return new TopicExchange(properties.getExchange(), true, false);
    }

    @Bean
    Queue userRegisteredQueue(MessagingProperties properties) {
        return QueueBuilder.durable(properties.getQueues().getUserRegistered()).build();
    }

    @Bean
    Binding userRegisteredBinding(
            Queue userRegisteredQueue,
            TopicExchange fitrackEventsExchange,
            MessagingProperties properties
    ) {
        return BindingBuilder
                .bind(userRegisteredQueue)
                .to(fitrackEventsExchange)
                .with(properties.getRoutingKeys().getUserRegistered());
    }

    @Bean
    MessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
