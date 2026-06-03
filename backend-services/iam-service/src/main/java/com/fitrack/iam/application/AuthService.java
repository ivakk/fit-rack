package com.fitrack.iam.application;

import com.fitrack.iam.api.dto.*;
import com.fitrack.iam.application.event.UserRegisteredEvent;
import com.fitrack.iam.application.port.in.AuthUseCase;
import com.fitrack.iam.application.port.out.DomainEventPublisher;
import com.fitrack.iam.application.port.out.PasswordHasher;
import com.fitrack.iam.application.port.out.RefreshTokenStore;
import com.fitrack.iam.application.port.out.TokenProvider;
import com.fitrack.iam.application.port.out.UserStore;
import com.fitrack.iam.domain.RefreshToken;
import com.fitrack.iam.domain.User;
import com.fitrack.iam.util.ClockProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements AuthUseCase {

    private final UserStore users;
    private final RefreshTokenStore refreshTokens;
    private final TokenProvider tokens;
    private final PasswordHasher hasher;
    private final ClockProvider clock;
    private final DomainEventPublisher events;


    @Override
    public TokenPairResponse register(RegisterRequest req) {
        users.findByEmail(req.getEmail()).ifPresent(u -> {
            throw new RuntimeException("Email already in use");
        });

        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(hasher.hash(req.getPassword()))
                .fullName(req.getFullName())
                .role("MEMBER")
                .phoneNumber(req.getPhoneNumber())
                .gender(req.getGender())
                .build();

        User savedUser = users.save(user);
        events.publishUserRegistered(new UserRegisteredEvent(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole(),
                clock.now().toInstant(ZoneOffset.UTC)
        ));
        return issue(savedUser);
    }

    @Override
    public TokenPairResponse login(LoginRequest req) {
        User found = users.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!hasher.matches(req.getPassword(), found.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        return issue(found);
    }

    @Override
    public TokenPairResponse refresh(RefreshRequest req) {
        RefreshToken token = refreshTokens.findActiveByToken(req.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (token.getExpiresAt().isBefore(clock.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        refreshTokens.revoke(token);
        User user = users.findById(token.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return issue(user);
    }

    @Override
    public MeResponse me(String userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MeResponse response = new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getGender()
        );

        return response;
    }

    private TokenPairResponse issue(User user) {
        String access = tokens.createAccessToken(user.getId(), user.getEmail(), user.getRole());
        RefreshToken refresh = RefreshToken.builder()
                .userId(user.getId())
                .token(UUID.randomUUID().toString())
                .createdAt(clock.now())
                .expiresAt(clock.now().plusDays(14))
                .revoked(false)
                .build();
        refreshTokens.save(refresh);
        return new TokenPairResponse(access, refresh.getToken());
    }
}
