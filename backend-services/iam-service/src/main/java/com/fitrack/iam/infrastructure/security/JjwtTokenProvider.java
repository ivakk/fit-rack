package com.fitrack.iam.infrastructure.security;

import com.fitrack.iam.application.port.out.TokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.util.Date;

@Component
public class JjwtTokenProvider implements TokenProvider {

    private final Key key;
    private final String issuer;
    private final long ttlMinutes;

    public JjwtTokenProvider(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.issuer}") String issuer,
            @Value("${security.jwt.access-ttl-minutes}") long ttlMinutes
    ) {
        // ensure secret has enough entropy/length for HS256
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.ttlMinutes = ttlMinutes;
    }

    @Override
    public String createAccessToken(String userId, String email, String role) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + Duration.ofMinutes(ttlMinutes).toMillis());
        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(String.valueOf(userId))
                .setIssuedAt(now)
                .setExpiration(exp)
                .claim("email", email)
                .claim("role", role)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    @Override
    public Claims parse(String jwt) {
        return Jwts.parserBuilder()
                .requireIssuer(issuer)
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwt)
                .getBody();
    }
}
