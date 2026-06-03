package com.fitrack.iam.application.port.in;

import com.fitrack.iam.api.dto.*;

public interface AuthUseCase {
    TokenPairResponse register(RegisterRequest req);
    TokenPairResponse login(LoginRequest req);
    TokenPairResponse refresh(RefreshRequest req);
    MeResponse me(String userId);

    /** Permanently removes the account and all IAM data for this user. */
    void deleteAccount(String userId);

    /** False when the user row was removed (e.g. after account deletion). */
    boolean userExists(String userId);
}
