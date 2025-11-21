package com.example.BackEnd.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record RoomCreateRequest(
        @NotEmpty(message = "Room name is required") @Size(min = 1, max = 100, message = "Room name must be between 1 and 100 characters") String name,

        @Size(min = 6, max = 6, message = "Password must be 6 characters") String password,

        @Min(value = 1, message = "Max members must be at least 1") @Max(value = 10, message = "Max members cannot exceed 10") Integer maxMembers) {
    public RoomCreateRequest {
        if (name != null)
            name = name.trim();
        if (password != null)
            password = password.trim();
    }
}