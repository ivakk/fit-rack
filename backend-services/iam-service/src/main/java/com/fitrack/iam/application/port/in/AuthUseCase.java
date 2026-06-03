package com.fitrack.iam.application.port.in;

import com.fitrack.iam.api.dto.*;

public interface AuthUseCase {
    TokenPairResponse register(RegisterRequest req);
    TokenPairResponse login(LoginRequest req);
    TokenPairResponse refresh(RefreshRequest req);
    MeResponse me(String userId);
}
