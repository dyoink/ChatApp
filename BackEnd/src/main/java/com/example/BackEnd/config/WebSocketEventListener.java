package com.example.BackEnd.config;

import com.example.BackEnd.dto.UserStatusMessage;
import com.example.BackEnd.entity.RoomMembers;
import com.example.BackEnd.entity.Users;
import com.example.BackEnd.repository.RoomMembersRepository;
import com.example.BackEnd.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.List;

@Component
public class WebSocketEventListener {

    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private RoomMembersRepository roomMembersRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal userPrincipal = accessor.getUser();
        if (userPrincipal == null)
            return;
        String email = userPrincipal.getName();
        Users user = usersRepository.findByEmail(email).orElse(null);
        if (user == null)
            return;
        List<RoomMembers> rooms = roomMembersRepository.findByUserId(user.getId());
        for (RoomMembers rm : rooms) {
            UserStatusMessage status = new UserStatusMessage(
                    user.getId(), user.getUsername(), user.getAvatarUrl(),
                    rm.getRoom().getId(), "online");
            messagingTemplate.convertAndSend("/topic/rooms/" + rm.getRoom().getId() + "/status", status);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal userPrincipal = accessor.getUser();
        if (userPrincipal == null)
            return;
        String email = userPrincipal.getName();
        Users user = usersRepository.findByEmail(email).orElse(null);
        if (user == null)
            return;
        List<RoomMembers> rooms = roomMembersRepository.findByUserId(user.getId());
        for (RoomMembers rm : rooms) {
            UserStatusMessage status = new UserStatusMessage(
                    user.getId(), user.getUsername(), user.getAvatarUrl(),
                    rm.getRoom().getId(), "offline");
            messagingTemplate.convertAndSend("/topic/rooms/" + rm.getRoom().getId() + "/status", status);
        }
    }
}