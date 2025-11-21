package com.example.BackEnd.service;

import com.example.BackEnd.dto.ChatMessagePageResponse;
import com.example.BackEnd.dto.ChatMessageRequest;
import com.example.BackEnd.dto.ChatMessageResponse;
import com.example.BackEnd.dto.SeenStatusRequest;

public interface ChatService {
    ChatMessageResponse sendMessage(String senderEmail, ChatMessageRequest request);

    ChatMessagePageResponse getMessageHistory(String userEmail, Long roomId, int page, int size);

    void deleteMessage(String userEmail, Long roomId, Long messageId);

    ChatMessageResponse markMessageSeen(String userEmail, SeenStatusRequest request);
}