package com.cineverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ============================================================
 *  CineverseApplication — Spring Boot Entry Point
 * ============================================================
 *
 *  @SpringBootApplication enables:
 *  - @Configuration: App configuration
 *  - @EnableAutoConfiguration: Spring Boot auto-config (JPA, Web, etc.)
 *  - @ComponentScan: Discovers all @Service, @Controller, @Repository
 *
 *  Day 10: This class is the entry point for the Docker container.
 *  When Docker runs: java -jar booking-service.jar
 *  → This main() method starts the Spring Boot application.
 * ============================================================
 */
@SpringBootApplication
public class CineverseApplication {

    public static void main(String[] args) {
        SpringApplication.run(CineverseApplication.class, args);
    }
}
