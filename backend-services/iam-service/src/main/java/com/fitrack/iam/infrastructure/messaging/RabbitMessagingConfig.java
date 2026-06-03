package com.fitrack.iam.infrastructure.messaging;

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
    MessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
