package com.fitrack.iam.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenPairResponse {
    private String accessToken;
    private String refreshToken;
}
