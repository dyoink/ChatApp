package com.example.BackEnd.dto;

import java.util.List;

public record RoomSearchResponse(
        List<RoomResponse> rooms,
        int page,
        int size,
        long totalElements) {
}