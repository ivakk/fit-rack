package com.fitrack.iam.application.port.out;

import io.jsonwebtoken.Claims;

public interface TokenProvider {
    String createAccessToken(String userId, String email, String role);
    Claims parse(String jwt);
}
