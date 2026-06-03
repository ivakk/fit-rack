package com.fitrack.workout.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Reads user id from gateway-injected internal headers only.
 * Rejects client-supplied {@code X-User-Id} when gateway trust is required.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@RequiredArgsConstructor
public class UserIdRequiredFilter extends OncePerRequestFilter {

    public static final String USER_ID_REQUEST_ATTRIBUTE = "fitrack.userId";

    private final GatewayIdentityProperties gatewayIdentity;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/workouts");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (gatewayIdentity.isRequireTrustedHeader()) {
            String trusted = request.getHeader(gatewayIdentity.getTrustedHeader());
            if (trusted == null || !trusted.equals(gatewayIdentity.getTrustedSecret())) {
                writeError(
                        response,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Request must go through the API gateway with a valid Bearer token"
                );
                return;
            }

            String forbidden = request.getHeader(gatewayIdentity.getForbiddenClientHeader());
            if (forbidden != null && !forbidden.isBlank()) {
                writeError(
                        response,
                        HttpServletResponse.SC_BAD_REQUEST,
                        "Do not send " + gatewayIdentity.getForbiddenClientHeader()
                                + "; use Authorization: Bearer via the gateway"
                );
                return;
            }
        }

        String userId = request.getHeader(gatewayIdentity.getUserIdHeader());
        if (userId == null || userId.isBlank()) {
            writeError(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Missing " + gatewayIdentity.getUserIdHeader()
                            + " (injected by API gateway after authentication)"
            );
            return;
        }

        request.setAttribute(USER_ID_REQUEST_ATTRIBUTE, userId.trim());
        filterChain.doFilter(request, response);
    }

    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"error\":\"" + escapeJson(message) + "\"}");
    }

    private static String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
