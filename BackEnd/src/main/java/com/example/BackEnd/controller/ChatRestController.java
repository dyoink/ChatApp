package com.example.BackEnd.controller;

import com.example.BackEnd.dto.ApiResponse;
import com.example.BackEnd.dto.ChatMessagePageResponse;
import com.example.BackEnd.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
public class ChatRestController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<ApiResponse<ChatMessagePageResponse>> getMessageHistory(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            ChatMessagePageResponse result = chatService.getMessageHistory(email, roomId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Messages fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{roomId}/messages/{messageId}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable Long roomId,
            @PathVariable Long messageId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            chatService.deleteMessage(email, roomId, messageId);
            return ResponseEntity.ok(ApiResponse.success("Message deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}