package com.fitrack.iam.validation;

public final class PasswordPolicy {

    public static final String PATTERN = "^(?=.*[A-Za-z])(?=.*\\d).{8,128}$";
    public static final String MESSAGE =
            "Password must be 8–128 characters and include at least one letter and one digit";

    private PasswordPolicy() {
    }
}
