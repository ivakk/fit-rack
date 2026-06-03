package com.fitrack.iam.infrastructure.security;

import com.fitrack.iam.application.port.out.PasswordHasher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BcryptPasswordHasher implements PasswordHasher {

    private final String pepper;
    private final BCryptPasswordEncoder encoder;

    public BcryptPasswordHasher(
            @Value("${security.password.pepper:}") String pepper,
            @Value("${security.password.bcrypt-strength:12}") int strength
    ) {
        this.pepper = pepper == null ? "" : pepper;
        this.encoder = new BCryptPasswordEncoder(strength);
    }

    @Override
    public String hash(String raw) {
        return encoder.encode(raw + pepper);
    }

    @Override
    public boolean matches(String raw, String hashed) {
        return encoder.matches(raw + pepper, hashed);
    }
}
