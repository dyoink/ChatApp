package com.example.BackEnd.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record RoomJoinRequest(
        @NotEmpty(message = "Room code is required") @Size(min = 6, max = 6, message = "Room code must be 6 characters") String code,

        String password) {
    public RoomJoinRequest {
        if (code != null)
            code = code.trim();
        if (password != null)
            password = password.trim();
    }
}