package com.fsd.experiment8.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @GetMapping("/welcome")
    public ResponseEntity<Map<String, String>> welcome() {
        return ResponseEntity.ok(Map.of(
            "message", "Welcome to Spring Security JWT Demo",
            "info", "This is a public endpoint - no authentication required"
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Application is running"
        ));
    }
}
