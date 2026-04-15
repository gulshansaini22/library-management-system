package com.library.backend.security;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    
    public String generateToken(String username) {
        // Simple dummy token for now
        return "dummy-token-" + System.currentTimeMillis();
    }
    
    public String extractUsername(String token) {
        // Simple extraction for dummy token
        return token.split("-")[2];
    }
    
    public Boolean validateToken(String token, String username) {
        return token.contains(username);
    }
}