package com.fitrack.iam.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    private String id;
    private String email;
    private String passwordHash;
    private String fullName;
    private String role;
    private String phoneNumber;
    private String gender;
}
