package com.library.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String email = request.get("email");
        String password = request.get("password");
        
        if ("admin@library.com".equals(email) && "admin123".equals(password)) {
            response.put("token", "dummy-token-123");
            response.put("email", email);
            response.put("role", "ADMIN");
            response.put("name", "Admin User");
            response.put("success", true);
        } else if ("user@library.com".equals(email) && "user123".equals(password)) {
            response.put("token", "dummy-token-456");
            response.put("email", email);
            response.put("role", "USER");
            response.put("name", "Regular User");
            response.put("success", true);
        } else {
            response.put("success", false);
            response.put("message", "Invalid credentials");
        }
        return response;
    }
    
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User registered successfully");
        return response;
    }
}