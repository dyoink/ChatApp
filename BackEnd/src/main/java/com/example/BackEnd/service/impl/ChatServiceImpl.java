package com.example.BackEnd.service.impl;

import com.example.BackEnd.dto.ChatMessageRequest;
import com.example.BackEnd.dto.ChatMessageResponse;
import com.example.BackEnd.dto.ChatMessagePageResponse;
import com.example.BackEnd.dto.SeenStatusRequest;
import com.example.BackEnd.entity.Messages;
import com.example.BackEnd.entity.RoomMembers;
import com.example.BackEnd.entity.Rooms;
import com.example.BackEnd.entity.Users;
import com.example.BackEnd.repository.MessagesRepository;
import com.example.BackEnd.repository.RoomMembersRepository;
import com.example.BackEnd.repository.RoomsRepository;
import com.example.BackEnd.repository.UsersRepository;
import com.example.BackEnd.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private RoomsRepository roomsRepository;
    @Autowired
    private RoomMembersRepository roomMembersRepository;
    @Autowired
    private MessagesRepository messagesRepository;

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(String senderEmail, ChatMessageRequest request) {
        Users sender = usersRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        Rooms room = roomsRepository.findById(request.roomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        // Kiểm tra user có phải thành viên phòng không
        if (!roomMembersRepository.existsByRoomIdAndUserId(room.getId(), sender.getId())) {
            throw new IllegalArgumentException("User is not a member of the room");
        }
        // Lưu message
        Messages message = new Messages();
        message.setRoom(room);
        message.setUser(sender);
        message.setContent(request.content());
        message.setContentType(Messages.ContentType.valueOf(request.contentType().toUpperCase()));
        message.setTimestamp(LocalDateTime.now());
        message.setSeenBy(String.valueOf(sender.getId())); // Người gửi đã seen
        Messages saved = messagesRepository.save(message);
        // Chuẩn bị response
        List<Long> seenBy = new ArrayList<>();
        if (saved.getSeenBy() != null && !saved.getSeenBy().isBlank()) {
            seenBy = Arrays.stream(saved.getSeenBy().split(","))
                    .map(Long::parseLong).toList();
        }
        return new ChatMessageResponse(
                saved.getId(),
                room.getId(),
                sender.getId(),
                sender.getUsername(),
                sender.getAvatarUrl(),
                saved.getContent(),
                saved.getContentType().name().toLowerCase(),
                saved.getTimestamp(),
                seenBy);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatMessagePageResponse getMessageHistory(String userEmail, Long roomId, int page, int size) {
        Users user = usersRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Rooms room = roomsRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        if (!roomMembersRepository.existsByRoomIdAndUserId(roomId, user.getId())) {
            throw new IllegalArgumentException("User is not a member of the room");
        }
        var pageResult = messagesRepository.findByRoomIdOrderByTimestampDesc(roomId,
                org.springframework.data.domain.PageRequest.of(page, size));
        var messages = pageResult.getContent().stream().map(msg -> {
            java.util.List<Long> seenBy = new java.util.ArrayList<>();
            if (msg.getSeenBy() != null && !msg.getSeenBy().isBlank()) {
                seenBy = java.util.Arrays.stream(msg.getSeenBy().split(",")).map(Long::parseLong).toList();
            }
            return new com.example.BackEnd.dto.ChatMessageResponse(
                    msg.getId(),
                    roomId,
                    msg.getUser().getId(),
                    msg.getUser().getUsername(),
                    msg.getUser().getAvatarUrl(),
                    msg.getContent(),
                    msg.getContentType().name().toLowerCase(),
                    msg.getTimestamp(),
                    seenBy);
        }).toList();
        return new ChatMessagePageResponse(messages, page, size, pageResult.getTotalElements());
    }

    @Override
    @Transactional
    public void deleteMessage(String userEmail, Long roomId, Long messageId) {
        Users user = usersRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Rooms room = roomsRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        if (!room.getCreator().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Only the room creator can delete messages");
        }
        Messages message = messagesRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        if (!message.getRoom().getId().equals(roomId)) {
            throw new IllegalArgumentException("Message does not belong to this room");
        }
        messagesRepository.delete(message);
    }

    @Override
    @Transactional
    public ChatMessageResponse markMessageSeen(String userEmail, SeenStatusRequest request) {
        Users user = usersRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Rooms room = roomsRepository.findById(request.roomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        if (!roomMembersRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            throw new IllegalArgumentException("User is not a member of the room");
        }
        Messages message = messagesRepository.findById(request.messageId())
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        if (!message.getRoom().getId().equals(room.getId())) {
            throw new IllegalArgumentException("Message does not belong to this room");
        }
        // Cập nhật seenBy
        String seenByStr = message.getSeenBy();
        java.util.Set<Long> seenBySet = new java.util.HashSet<>();
        if (seenByStr != null && !seenByStr.isBlank()) {
            for (String s : seenByStr.split(",")) {
                seenBySet.add(Long.parseLong(s));
            }
        }
        seenBySet.add(user.getId());
        message.setSeenBy(seenBySet.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(",")));
        Messages saved = messagesRepository.save(message);
        // Chuẩn bị response
        java.util.List<Long> seenBy = new java.util.ArrayList<>(seenBySet);
        return new com.example.BackEnd.dto.ChatMessageResponse(
                saved.getId(),
                room.getId(),
                saved.getUser().getId(),
                saved.getUser().getUsername(),
                saved.getUser().getAvatarUrl(),
                saved.getContent(),
                saved.getContentType().name().toLowerCase(),
                saved.getTimestamp(),
                seenBy);
    }
}