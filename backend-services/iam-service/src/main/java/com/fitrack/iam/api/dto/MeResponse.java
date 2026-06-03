package com.fitrack.iam.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeResponse {
    private String id;
    private String email;
    private String fullName;
    private String role;
    private String phoneNumber;
    private String gender;
}
