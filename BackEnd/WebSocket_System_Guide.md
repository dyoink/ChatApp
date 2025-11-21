# Hướng Dẫn Chi Tiết Hệ Thống WebSocket ChatApp

## 1. Tổng Quan Hệ Thống WebSocket

### 1.1 WebSocket là gì?
WebSocket là một giao thức truyền thông hai chiều (bidirectional) cho phép client và server trao đổi dữ liệu real-time mà không cần client phải liên tục gửi request (polling). Điều này rất phù hợp cho ứng dụng chat real-time.

### 1.2 Kiến Trúc Tổng Thể
```
Frontend (React/Next.js) ←→ WebSocket ←→ Backend (Spring Boot)
     ↓                           ↓              ↓
  UI Components            STOMP Protocol    Business Logic
  Real-time Updates        Message Broker    Database
```

## 2. Cấu Hình Backend WebSocket

### 2.1 Dependencies (pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### 2.2 Cấu Hình WebSocket (WebSocketConfig.java)
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Broker cho client subscribe để nhận tin nhắn
        config.enableSimpleBroker("/topic");
        // Prefix cho client gửi message tới server
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat")
                .setAllowedOriginPatterns("*") // Cho phép tất cả origin
                .addInterceptors(jwtHandshakeInterceptor); // JWT xác thực
    }
}
```

**Giải thích:**
- `/topic`: Client subscribe để nhận tin nhắn broadcast
- `/app`: Client gửi message tới server
- `/chat`: Endpoint WebSocket chính
- `jwtHandshakeInterceptor`: Xác thực JWT khi handshake

## 3. Quá Trình Handshake và Xác Thực

### 3.1 JWT Handshake Interceptor
```java
@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, 
                                 ServerHttpResponse response,
                                 WebSocketHandler wsHandler, 
                                 Map<String, Object> attributes) {
        // 1. Lấy JWT token từ query parameter hoặc header
        String token = extractToken(request);
        
        // 2. Validate JWT token
        if (!jwtTokenProvider.validateToken(token)) {
            return false; // Từ chối kết nối
        }
        
        // 3. Lấy email từ token và lưu vào session
        String email = jwtTokenProvider.getEmailFromToken(token);
        attributes.put("user", new StompPrincipal(email));
        
        return true; // Chấp nhận kết nối
    }
}
```

### 3.2 Luồng Handshake Chi Tiết
1. **Client gửi WebSocket connection request** với JWT token
2. **JwtHandshakeInterceptor** intercept request
3. **Extract JWT token** từ query parameter hoặc header
4. **Validate token** bằng JwtTokenProvider
5. **Nếu valid**: Lưu user info vào session attributes
6. **Nếu invalid**: Từ chối kết nối
7. **WebSocket connection được thiết lập** nếu xác thực thành công

## 4. Cấu Trúc Message và Routing

### 4.1 STOMP Message Structure
```
Destination: /app/rooms/{roomId}/send
Headers: {
    "Authorization": "Bearer <jwt_token>",
    "content-type": "application/json"
}
Body: {
    "roomId": 123,
    "content": "Hello world!",
    "contentType": "text"
}
```

### 4.2 Message Routing
- **Client → Server**: `/app/rooms/{roomId}/send`
- **Server → Client**: `/topic/rooms/{roomId}`
- **Status Updates**: `/topic/rooms/{roomId}/status`

## 5. Xử Lý Tin Nhắn Real-time

### 5.1 ChatController - Xử Lý Tin Nhắn Gửi Đi
```java
@Controller
public class ChatController {
    
    @MessageMapping("/rooms/{roomId}/send")
    public void sendMessage(@Payload @Valid ChatMessageRequest request, 
                          SimpMessageHeaderAccessor headerAccessor) {
        // 1. Lấy user từ session (đã được xác thực trong handshake)
        Principal principal = (Principal) headerAccessor.getSessionAttributes().get("user");
        String email = principal.getName();
        
        // 2. Xử lý business logic (lưu vào DB, validate, etc.)
        ChatMessageResponse response = chatService.sendMessage(email, request);
        
        // 3. Broadcast tin nhắn tới tất cả user trong room
        messagingTemplate.convertAndSend("/topic/rooms/" + request.roomId(), response);
    }
}
```

### 5.2 ChatService - Business Logic
```java
@Service
public class ChatServiceImpl implements ChatService {
    
    @Override
    @Transactional
    public ChatMessageResponse sendMessage(String senderEmail, ChatMessageRequest request) {
        // 1. Validate user và room
        Users sender = usersRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        Rooms room = roomsRepository.findById(request.roomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        
        // 2. Kiểm tra user có phải thành viên phòng không
        if (!roomMembersRepository.existsByRoomIdAndUserId(room.getId(), sender.getId())) {
            throw new IllegalArgumentException("User is not a member of the room");
        }
        
        // 3. Lưu message vào database
        Messages message = new Messages();
        message.setRoom(room);
        message.setUser(sender);
        message.setContent(request.content());
        message.setContentType(Messages.ContentType.valueOf(request.contentType().toUpperCase()));
        message.setTimestamp(LocalDateTime.now());
        message.setSeenBy(String.valueOf(sender.getId())); // Người gửi đã seen
        
        Messages saved = messagesRepository.save(message);
        
        // 4. Chuẩn bị response để broadcast
        return new ChatMessageResponse(
            saved.getId(), room.getId(), sender.getId(),
            sender.getUsername(), sender.getAvatarUrl(),
            saved.getContent(), saved.getContentType().toString(),
            saved.getTimestamp(), parseSeenBy(saved.getSeenBy())
        );
    }
}
```

## 6. WebSocket Event Listeners

### 6.1 Xử Lý Kết Nối/Ngắt Kết Nối
```java
@Component
public class WebSocketEventListener {
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        // 1. Lấy user info từ session
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal userPrincipal = accessor.getUser();
        String email = userPrincipal.getName();
        
        // 2. Lấy thông tin user và rooms
        Users user = usersRepository.findByEmail(email).orElse(null);
        List<RoomMembers> rooms = roomMembersRepository.findByUserId(user.getId());
        
        // 3. Broadcast status "online" tới tất cả rooms của user
        for (RoomMembers rm : rooms) {
            UserStatusMessage status = new UserStatusMessage(
                user.getId(), user.getUsername(), user.getAvatarUrl(),
                rm.getRoom().getId(), "online"
            );
            messagingTemplate.convertAndSend("/topic/rooms/" + rm.getRoom().getId() + "/status", status);
        }
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        // Tương tự như connect, nhưng broadcast status "offline"
        // ...
    }
}
```

## 7. Frontend Integration

### 7.1 Kết Nối WebSocket (React/Next.js)
```javascript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
    }
    
    connect(token) {
        // 1. Tạo SockJS connection với JWT token
        const socket = new SockJS(`ws://backend:8080/chat?Authorization=Bearer ${token}`);
        
        // 2. Tạo STOMP client
        this.stompClient = Stomp.over(socket);
        
        // 3. Kết nối với callback
        this.stompClient.connect({}, 
            (frame) => {
                console.log('Connected to WebSocket');
                this.connected = true;
                this.subscribeToRooms();
            },
            (error) => {
                console.error('WebSocket connection error:', error);
                this.connected = false;
            }
        );
    }
    
    subscribeToRoom(roomId) {
        // Subscribe để nhận tin nhắn từ room
        this.stompClient.subscribe(`/topic/rooms/${roomId}`, (message) => {
            const chatMessage = JSON.parse(message.body);
            // Xử lý tin nhắn mới (update UI, play sound, etc.)
            this.handleNewMessage(chatMessage);
        });
        
        // Subscribe để nhận status updates
        this.stompClient.subscribe(`/topic/rooms/${roomId}/status`, (message) => {
            const statusUpdate = JSON.parse(message.body);
            // Xử lý status update (online/offline)
            this.handleStatusUpdate(statusUpdate);
        });
    }
    
    sendMessage(roomId, content, contentType = 'text') {
        if (!this.connected) return;
        
        // Gửi tin nhắn tới server
        this.stompClient.send(`/app/rooms/${roomId}/send`, {}, JSON.stringify({
            roomId: roomId,
            content: content,
            contentType: contentType
        }));
    }
    
    markMessageSeen(roomId, messageId) {
        if (!this.connected) return;
        
        // Đánh dấu tin nhắn đã xem
        this.stompClient.send(`/app/rooms/${roomId}/messages/${messageId}/seen`, {}, JSON.stringify({
            roomId: roomId,
            messageId: messageId
        }));
    }
}
```

### 7.2 Sử Dụng Trong React Component
```javascript
import { useEffect, useState } from 'react';
import WebSocketService from './WebSocketService';

function ChatRoom({ roomId, token }) {
    const [messages, setMessages] = useState([]);
    const [wsService] = useState(new WebSocketService());
    
    useEffect(() => {
        // Kết nối WebSocket khi component mount
        wsService.connect(token);
        
        // Subscribe tới room
        wsService.subscribeToRoom(roomId);
        
        // Cleanup khi component unmount
        return () => {
            wsService.disconnect();
        };
    }, [roomId, token]);
    
    const sendMessage = (content) => {
        wsService.sendMessage(roomId, content);
    };
    
    return (
        <div>
            {/* Chat UI */}
            <div className="messages">
                {messages.map(msg => (
                    <MessageComponent key={msg.id} message={msg} />
                ))}
            </div>
            <MessageInput onSend={sendMessage} />
        </div>
    );
}
```

## 8. Luồng Hoạt Động Chi Tiết

### 8.1 Khi User Gửi Tin Nhắn
1. **Frontend**: User nhập tin nhắn và click send
2. **Frontend**: Gọi `wsService.sendMessage(roomId, content)`
3. **Frontend**: STOMP client gửi message tới `/app/rooms/{roomId}/send`
4. **Backend**: `ChatController.sendMessage()` nhận message
5. **Backend**: Validate user và room membership
6. **Backend**: Lưu message vào database
7. **Backend**: Tạo `ChatMessageResponse` object
8. **Backend**: Broadcast response tới `/topic/rooms/{roomId}`
9. **Frontend**: Tất cả clients trong room nhận được message
10. **Frontend**: Update UI với tin nhắn mới

### 8.2 Khi User Kết Nối/Ngắt Kết Nối
1. **Frontend**: User mở/đóng browser tab
2. **Backend**: `WebSocketEventListener` detect connect/disconnect event
3. **Backend**: Lấy user info từ session
4. **Backend**: Tìm tất cả rooms của user
5. **Backend**: Broadcast status "online"/"offline" tới từng room
6. **Frontend**: Các clients khác nhận status update
7. **Frontend**: Update UI (online indicator, user list, etc.)

### 8.3 Khi User Đánh Dấu Tin Nhắn Đã Xem
1. **Frontend**: User scroll tới tin nhắn hoặc click "mark as read"
2. **Frontend**: Gọi `wsService.markMessageSeen(roomId, messageId)`
3. **Backend**: `ChatController.markMessageSeen()` nhận request
4. **Backend**: Update `seenBy` field trong database
5. **Backend**: Broadcast updated message tới room
6. **Frontend**: Update UI (seen indicators, etc.)

## 9. Bảo Mật và Validation

### 9.1 JWT Authentication
- **Handshake**: Validate JWT token trước khi cho phép WebSocket connection
- **Session**: Lưu user info trong session để sử dụng trong các message handlers
- **Authorization**: Kiểm tra user có quyền truy cập room không trước khi xử lý message

### 9.2 Message Validation
- **Input Validation**: Validate message content, roomId, messageId
- **Business Rules**: Kiểm tra user có phải thành viên room không
- **Rate Limiting**: Có thể thêm rate limiting để tránh spam

## 10. Error Handling

### 10.1 Backend Error Handling
```java
@MessageExceptionHandler
public void handleMessageException(MessageException exception) {
    // Log error
    logger.error("WebSocket message error: ", exception);
    
    // Có thể gửi error message về client
    messagingTemplate.convertAndSend("/topic/errors", 
        new ErrorResponse("Message processing failed"));
}
```

### 10.2 Frontend Error Handling
```javascript
// Reconnection logic
wsService.stompClient.onStompError = (frame) => {
    console.error('STOMP error:', frame);
    // Thử kết nối lại sau 5 giây
    setTimeout(() => {
        wsService.connect(token);
    }, 5000);
};
```

## 11. Performance và Scalability

### 11.1 Database Optimization
- **Indexing**: Index trên roomId, userId, timestamp
- **Pagination**: Load messages theo trang để tránh load quá nhiều data
- **Caching**: Cache user info, room info để giảm database queries

### 11.2 WebSocket Optimization
- **Connection Pooling**: Quản lý WebSocket connections hiệu quả
- **Message Compression**: Nén message nếu cần
- **Heartbeat**: Giữ connection alive với heartbeat messages

## 12. Monitoring và Logging

### 12.1 Backend Logging
```java
@EventListener
public void handleWebSocketConnectListener(SessionConnectEvent event) {
    logger.info("User connected: {}", event.getUser().getName());
    // ... existing logic
}
```

### 12.2 Frontend Monitoring
```javascript
// Track connection status
wsService.stompClient.onConnect = () => {
    analytics.track('websocket_connected');
};

wsService.stompClient.onDisconnect = () => {
    analytics.track('websocket_disconnected');
};
```

---

## Kết Luận

Hệ thống WebSocket trong ChatApp này được thiết kế với:
- **Bảo mật cao**: JWT authentication, authorization checks
- **Real-time performance**: STOMP protocol, efficient message routing
- **Scalability**: Stateless design, database optimization
- **User experience**: Online/offline status, message seen indicators
- **Error handling**: Comprehensive error handling và reconnection logic

Hệ thống này có thể handle hàng nghìn concurrent users và đảm bảo tin nhắn được gửi real-time với độ tin cậy cao. 