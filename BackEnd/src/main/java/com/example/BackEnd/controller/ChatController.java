package com.example.BackEnd.controller;

import com.example.BackEnd.dto.ChatMessageRequest;
import com.example.BackEnd.dto.ChatMessageResponse;
import com.example.BackEnd.dto.SeenStatusRequest;
import com.example.BackEnd.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/rooms/{roomId}/send")
    public void sendMessage(@Payload @Valid ChatMessageRequest request, SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = (Principal) headerAccessor.getSessionAttributes().get("user");
        String email = principal != null ? principal.getName() : null;
        if (email == null) {
            throw new IllegalArgumentException("Unauthorized");
        }
        ChatMessageResponse response = chatService.sendMessage(email, request);
        messagingTemplate.convertAndSend("/topic/rooms/" + request.roomId(), response);
    }

    @MessageMapping("/rooms/{roomId}/messages/{messageId}/seen")
    public void markMessageSeen(@Payload @Valid SeenStatusRequest request, SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = (Principal) headerAccessor.getSessionAttributes().get("user");
        String email = principal != null ? principal.getName() : null;
        if (email == null) {
            throw new IllegalArgumentException("Unauthorized");
        }
        ChatMessageResponse response = chatService.markMessageSeen(email, request);
        messagingTemplate.convertAndSend("/topic/rooms/" + request.roomId(), response);
    }
}