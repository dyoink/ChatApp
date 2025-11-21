package com.example.BackEnd.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

public record LoginRequest(
        @NotEmpty(message = "Email is required") @Email(message = "Email should be valid") String email,

        @NotEmpty(message = "Password is required") String password) {
    public LoginRequest {
        if (email != null) {
            email = email.trim().toLowerCase();
        }
    }
}