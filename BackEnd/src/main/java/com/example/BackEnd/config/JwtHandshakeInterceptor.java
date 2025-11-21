package com.example.BackEnd.config;

import com.example.BackEnd.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(JwtHandshakeInterceptor.class);

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String token = null;
        String query = request.getURI().getQuery();
        if (query != null && query.contains("Authorization")) {
            for (String param : query.split("&")) {
                if (param.startsWith("Authorization=")) {
                    token = param.substring("Authorization=".length());
                    break;
                }
            }
        }
        if (token == null && request.getHeaders().containsKey("Authorization")) {
            token = request.getHeaders().getFirst("Authorization");
        }
        if (token == null) {
            // logger.warn("[WebSocket] JWT missing in handshake (query/header)"); // Tắt
            return false;
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        } else {
            // logger.warn("[WebSocket] JWT does not start with 'Bearer ': {}", token);
        }
        if (!jwtTokenProvider.validateToken(token)) {
            // logger.warn("[WebSocket] JWT invalid or expired: {}", token);
            return false;
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        // logger.info("[WebSocket] JWT valid, user email: {}", email);
        attributes.put("user", new StompPrincipal(email));
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Exception exception) {
    }

    // Custom Principal để lưu email
    public static class StompPrincipal implements Principal {
        private final String name;

        public StompPrincipal(String name) {
            this.name = name;
        }

        @Override
        public String getName() {
            return name;
        }
    }
}