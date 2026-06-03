package com.fitrack.iam.api;

import com.fitrack.iam.api.dto.*;
import com.fitrack.iam.application.port.in.AuthUseCase;
import com.fitrack.iam.application.port.out.TokenProvider;
import com.fitrack.iam.web.GatewayHeaders;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase auth;
    private final TokenProvider tokens;

    @PostMapping("/register")
    public TokenPairResponse register(@Valid @RequestBody RegisterRequest body) {
        return auth.register(body);
    }

    @PostMapping("/login")
    public TokenPairResponse login(@Valid @RequestBody LoginRequest body) {
        return auth.login(body);
    }

    @PostMapping("/refresh")
    public TokenPairResponse refresh(@Valid @RequestBody RefreshRequest body) {
        return auth.refresh(body);
    }

    @GetMapping("/me")
    public MeResponse me(@RequestHeader("Authorization") String authHeader) {
        String jwt = authHeader.replace("Bearer ", "");
        Claims claims = tokens.parse(jwt);
        String userId = claims.getSubject();
        return auth.me(userId);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@RequestHeader("Authorization") String authHeader) {
        String jwt = authHeader.replace("Bearer ", "");
        Claims claims = tokens.parse(jwt);
        auth.deleteAccount(claims.getSubject());
    }

    /**
     * Traefik ForwardAuth: validate JWT and return internal identity headers for downstream services.
     * Clients must not send these headers.
     */
    @GetMapping("/forward-auth")
    public ResponseEntity<Void> forwardAuth(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        try {
            Claims claims = tokens.parse(authHeader.substring(7));
            if (!auth.userExists(claims.getSubject())) {
                return ResponseEntity.status(401).build();
            }
            return ResponseEntity.ok()
                    .header(GatewayHeaders.INTERNAL_USER_ID, claims.getSubject())
                    .header(GatewayHeaders.INTERNAL_USER_EMAIL, claims.get("email", String.class))
                    .header(GatewayHeaders.INTERNAL_USER_ROLE, claims.get("role", String.class))
                    .build();
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
