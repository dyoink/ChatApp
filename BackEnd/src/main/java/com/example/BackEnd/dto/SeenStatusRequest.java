package com.example.BackEnd.dto;

import jakarta.validation.constraints.NotNull;

public record SeenStatusRequest(
        @NotNull(message = "Room ID is required") Long roomId,
        @NotNull(message = "Message ID is required") Long messageId) {
}