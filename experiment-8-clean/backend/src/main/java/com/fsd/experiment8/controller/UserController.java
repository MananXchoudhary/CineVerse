package com.fsd.experiment8.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> userProfile(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
            "message", "Welcome to your profile",
            "username", authentication.getName(),
            "authorities", authentication.getAuthorities().toString()
        ));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> userDashboard() {
        return ResponseEntity.ok(Map.of(
            "message", "Welcome to User Dashboard",
            "access", "USER and ADMIN roles"
        ));
    }
}
