package com.example.BackEnd.dto;

public record RoomResponse(
                Long id,
                String name,
                String code,
                Integer maxMembers,
                String creatorUsername,
                Integer memberCount,
                Boolean hasPassword) {
}