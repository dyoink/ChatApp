package com.example.BackEnd.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ChatMessageRequest(
        @NotNull(message = "Room ID is required") Long roomId,

        @NotEmpty(message = "Content is required") String content,

        @NotEmpty(message = "Content type is required") String contentType // text, image, video
) {
}