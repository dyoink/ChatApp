package com.example.BackEnd.dto;

public record UserProfileResponse(
        Long id,
        String username,
        String email,
        String avatarUrl) {
}