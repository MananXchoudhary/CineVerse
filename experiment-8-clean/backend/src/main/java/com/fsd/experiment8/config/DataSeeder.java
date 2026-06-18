package com.fsd.experiment8.config;

import com.fsd.experiment8.entity.Role;
import com.fsd.experiment8.entity.User;
import com.fsd.experiment8.repository.RoleRepository;
import com.fsd.experiment8.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner initData(UserRepository userRepo,
                               RoleRepository roleRepo,
                               PasswordEncoder passwordEncoder) {

        return args -> {
            log.info("========================================");
            log.info("  SEEDING SAMPLE DATA");
            log.info("========================================");

            Role adminRole = roleRepo.save(new Role("ADMIN"));
            Role userRole = roleRepo.save(new Role("USER"));
            Role moderatorRole = roleRepo.save(new Role("MODERATOR"));

            User admin = new User("admin", passwordEncoder.encode("admin123"), "admin@example.com");
            admin.addRole(adminRole);
            admin.addRole(userRole);
            userRepo.save(admin);

            User user = new User("user", passwordEncoder.encode("user123"), "user@example.com");
            user.addRole(userRole);
            userRepo.save(user);

            User moderator = new User("moderator", passwordEncoder.encode("mod123"), "mod@example.com");
            moderator.addRole(userRole);
            moderator.addRole(moderatorRole);
            userRepo.save(moderator);

            log.info("========================================");
            log.info("  DATA SEEDING COMPLETE!");
            log.info("  Credentials:");
            log.info("    admin / admin123  (ADMIN, USER)");
            log.info("    user  / user123   (USER)");
            log.info("    moderator / mod123 (USER, MODERATOR)");
            log.info("  API: http://localhost:8080");
            log.info("========================================");
        };
    }
}
