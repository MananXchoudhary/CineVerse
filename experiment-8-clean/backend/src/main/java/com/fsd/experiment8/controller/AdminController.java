package com.fsd.experiment8.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> adminDashboard() {
        return ResponseEntity.ok(Map.of(
            "message", "Welcome to Admin Dashboard",
            "access", "ADMIN only"
        ));
    }

    @GetMapping("/users")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Map<String, String>> manageUsers() {
        return ResponseEntity.ok(Map.of(
            "message", "Admin: User management panel",
            "access", "ADMIN only (secured with @Secured)"
        ));
    }

    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> systemSettings() {
        return ResponseEntity.ok(Map.of(
            "message", "Admin: System settings",
            "access", "ADMIN only (secured with @PreAuthorize)"
        ));
    }
}
