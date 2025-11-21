package com.example.BackEnd.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ChatMessageResponse(
        Long id,
        Long roomId,
        Long userId,
        String username,
        String avatarUrl,
        String content,
        String contentType, // text, image, video
        LocalDateTime timestamp,
        List<Long> seenBy) {
}