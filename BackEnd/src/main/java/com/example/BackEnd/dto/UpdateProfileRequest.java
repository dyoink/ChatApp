package com.example.BackEnd.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username,

        @Size(min = 6, message = "Password must be at least 6 characters") String password,

        String avatarUrl) {
    public UpdateProfileRequest {
        if (username != null) {
            username = username.trim();
        }
    }
}