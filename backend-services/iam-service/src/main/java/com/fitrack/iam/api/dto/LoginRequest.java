package com.fitrack.iam.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @Email
    @NotBlank
    @Size(max = 254)
    private String email;

    @NotBlank
    @Size(max = 128)
    private String password;
}
