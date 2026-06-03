package com.fitrack.iam.api.dto;

import com.fitrack.iam.validation.PasswordPolicy;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @Email
    @NotBlank
    @Size(max = 254)
    private String email;

    @NotBlank
    @Pattern(regexp = PasswordPolicy.PATTERN, message = PasswordPolicy.MESSAGE)
    private String password;

    @NotBlank
    @Size(max = 200)
    private String fullName;

    @NotBlank
    @Size(max = 32)
    private String phoneNumber;

    @NotBlank
    @Size(max = 32)
    private String gender;
}
