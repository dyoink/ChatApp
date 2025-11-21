package com.example.BackEnd.dto;

import java.util.List;

public record ChatMessagePageResponse(
        List<ChatMessageResponse> messages,
        int page,
        int size,
        long totalElements) {
}