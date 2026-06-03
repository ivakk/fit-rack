package com.fitrack.iam.application;

import com.fitrack.iam.api.dto.LoginRequest;
import com.fitrack.iam.api.dto.RegisterRequest;
import com.fitrack.iam.application.event.UserDeletedEvent;
import com.fitrack.iam.application.event.UserRegisteredEvent;
import com.fitrack.iam.application.port.out.DomainEventPublisher;
import com.fitrack.iam.application.port.out.PasswordHasher;
import com.fitrack.iam.application.port.out.RefreshTokenStore;
import com.fitrack.iam.application.port.out.TokenProvider;
import com.fitrack.iam.application.port.out.UserStore;
import com.fitrack.iam.domain.RefreshToken;
import com.fitrack.iam.domain.User;
import com.fitrack.iam.util.ClockProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UserStore users;
    @Mock
    RefreshTokenStore refreshTokens;
    @Mock
    TokenProvider tokens;
    @Mock
    PasswordHasher hasher;
    @Mock
    ClockProvider clock;
    @Mock
    DomainEventPublisher events;

    @InjectMocks
    AuthService authService;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 6, 3, 12, 0);

    @Test
    void register_publishesEventAndReturnsTokens() {
        when(users.findByEmail("a@test.com")).thenReturn(Optional.empty());
        when(hasher.hash("secret")).thenReturn("hashed");
        when(clock.now()).thenReturn(NOW);

        User saved = User.builder()
                .id("user-1")
                .email("a@test.com")
                .passwordHash("hashed")
                .fullName("Alex")
                .role("MEMBER")
                .phoneNumber("+1")
                .gender("other")
                .build();
        when(users.save(any(User.class))).thenReturn(saved);
        when(tokens.createAccessToken(anyString(), anyString(), anyString())).thenReturn("access");
        when(refreshTokens.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RegisterRequest req = new RegisterRequest();
        req.setEmail("a@test.com");
        req.setPassword("secret");
        req.setFullName("Alex");
        req.setPhoneNumber("+1");
        req.setGender("other");

        var response = authService.register(req);

        assertThat(response.getAccessToken()).isEqualTo("access");
        assertThat(response.getRefreshToken()).isNotBlank();

        ArgumentCaptor<UserRegisteredEvent> eventCaptor = ArgumentCaptor.forClass(UserRegisteredEvent.class);
        verify(events).publishUserRegistered(eventCaptor.capture());
        assertThat(eventCaptor.getValue().userId()).isEqualTo("user-1");
        assertThat(eventCaptor.getValue().occurredAt()).isEqualTo(NOW.toInstant(ZoneOffset.UTC));
    }

    @Test
    void register_rejectsDuplicateEmail() {
        when(users.findByEmail("a@test.com")).thenReturn(Optional.of(User.builder().build()));

        RegisterRequest req = new RegisterRequest();
        req.setEmail("a@test.com");
        req.setPassword("secret");
        req.setFullName("Alex");
        req.setPhoneNumber("+1");
        req.setGender("other");

        assertThatThrownBy(() -> authService.register(req))
                .hasMessageContaining("Email already in use");
    }

    @Test
    void login_rejectsInvalidPassword() {
        User user = User.builder().email("a@test.com").passwordHash("hashed").build();
        when(users.findByEmail("a@test.com")).thenReturn(Optional.of(user));
        when(hasher.matches("wrong", "hashed")).thenReturn(false);

        LoginRequest req = new LoginRequest();
        req.setEmail("a@test.com");
        req.setPassword("wrong");

        assertThatThrownBy(() -> authService.login(req))
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void deleteAccount_publishesEventAndPurgesIamData() {
        when(clock.now()).thenReturn(NOW);
        User user = User.builder().id("user-1").email("a@test.com").build();
        when(users.findById("user-1")).thenReturn(Optional.of(user));

        authService.deleteAccount("user-1");

        ArgumentCaptor<UserDeletedEvent> eventCaptor = ArgumentCaptor.forClass(UserDeletedEvent.class);
        verify(events).publishUserDeleted(eventCaptor.capture());
        assertThat(eventCaptor.getValue().userId()).isEqualTo("user-1");
        verify(refreshTokens).deleteAllByUserId("user-1");
        verify(users).deleteById("user-1");
    }

    @Test
    void deleteAccount_unknownUserDoesNothing() {
        when(users.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.deleteAccount("missing"))
                .hasMessageContaining("User not found");

        verify(events, never()).publishUserDeleted(any());
        verify(users, never()).deleteById(anyString());
    }
}
