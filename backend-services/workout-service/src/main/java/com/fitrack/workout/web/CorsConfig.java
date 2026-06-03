package com.fitrack.workout.web;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class CorsConfig implements WebMvcConfigurer {

    private final CorsProperties properties;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(properties.getAllowedOrigins().toArray(String[]::new))
                .allowedMethods(properties.getAllowedMethods().toArray(String[]::new))
                .allowedHeaders(properties.getAllowedHeaders().toArray(String[]::new))
                .allowCredentials(properties.isAllowCredentials());
    }
}
