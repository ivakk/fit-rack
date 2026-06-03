package com.fitrack.iam.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import java.nio.charset.StandardCharsets;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable())
                .logout(l -> l.disable())
                .exceptionHandling(ex -> ex.authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(401);
                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    res.getOutputStream().write("{\"error\":\"Unauthorized\"}".getBytes(StandardCharsets.UTF_8));
                }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Actuator (default base-path = /actuator)
                        .requestMatchers("/actuator/**").permitAll()

                        // Public auth API
                        .requestMatchers("/auth/**").permitAll()

                        // Spring Boot error dispatch (avoid masking API errors as 401)
                        .requestMatchers("/error").permitAll()

                        // Root (optional)
                        .requestMatchers("/").permitAll()

                        // Everything else requires auth
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
