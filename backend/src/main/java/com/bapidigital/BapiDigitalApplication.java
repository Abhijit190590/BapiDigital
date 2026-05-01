package com.bapidigital;

import com.bapidigital.model.AdminConfig;
import com.bapidigital.model.AdminUser;
import com.bapidigital.repository.AdminConfigRepository;
import com.bapidigital.repository.AdminUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;

@SpringBootApplication
public class BapiDigitalApplication {

    public static void main(String[] args) {
        SpringApplication.run(BapiDigitalApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(AdminUserRepository adminUserRepo,
                               AdminConfigRepository configRepo,
                               PasswordEncoder passwordEncoder,
                               @Value("${app.admin.default-username}") String defaultUsername,
                               @Value("${app.admin.default-password}") String defaultPassword) {
        return args -> {
            // Create default admin if not exists
            if (adminUserRepo.findByUsername(defaultUsername).isEmpty()) {
                AdminUser admin = new AdminUser();
                admin.setUsername(defaultUsername);
                admin.setPassword(passwordEncoder.encode(defaultPassword));
                admin.setRole("ADMIN");
                adminUserRepo.save(admin);
                System.out.println("✅ Default admin user created: " + defaultUsername);
            }

            // Create default WhatsApp config if not exists
            if (configRepo.findAll().isEmpty()) {
                AdminConfig config = new AdminConfig();
                config.setWhatsappNumber("919876543210");
                configRepo.save(config);
                System.out.println("✅ Default WhatsApp config created");
            }
        };
    }
}
