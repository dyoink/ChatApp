package com.example.BackEnd.dto;

public record RoomMemberResponse(
        Long userId,
        String username,
        String avatarUrl,
        String role, // creator/admin/member
        boolean online) {
}