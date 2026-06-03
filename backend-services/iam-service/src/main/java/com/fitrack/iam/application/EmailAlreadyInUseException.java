package com.fitrack.iam.application;

public class EmailAlreadyInUseException extends RuntimeException {
    public EmailAlreadyInUseException() {
        super("Email already in use");
    }
}
