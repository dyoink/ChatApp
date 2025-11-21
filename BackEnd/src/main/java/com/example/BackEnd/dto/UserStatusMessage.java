package com.example.BackEnd.dto;

public record UserStatusMessage(
        Long userId,
        String username,
        String avatarUrl,
        Long roomId,
        String status // "online" hoặc "offline"
) {
}