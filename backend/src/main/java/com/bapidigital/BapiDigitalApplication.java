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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class BapiDigitalApplication {

    private static final Logger logger = LoggerFactory.getLogger(BapiDigitalApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(BapiDigitalApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(AdminUserRepository adminUserRepo,
                               AdminConfigRepository configRepo,
                               PasswordEncoder passwordEncoder,
                               org.springframework.core.env.Environment env) {
        return args -> {
            boolean createDefaultAdmin = Boolean.parseBoolean(env.getProperty("app.create-default-admin", "false"));
            String defaultUsername = env.getProperty("app.admin.default-username", "");
            String defaultPassword = env.getProperty("app.admin.default-password", "");

            if (createDefaultAdmin) {
                if (defaultUsername != null && !defaultUsername.isBlank() && defaultPassword != null && !defaultPassword.isBlank()) {
                    if (adminUserRepo.findByUsername(defaultUsername).isEmpty()) {
                        AdminUser admin = new AdminUser();
                        admin.setUsername(defaultUsername);
                        admin.setPassword(passwordEncoder.encode(defaultPassword));
                        admin.setRole("ADMIN");
                        adminUserRepo.save(admin);
                        logger.info("✅ Default admin user created: {}", defaultUsername);
                    }
                } else {
                    logger.warn("app.create-default-admin=true but admin username/password not provided. Skipping seeding.");
                }
            }

            // Create default WhatsApp config if not exists
            if (configRepo.findAll().isEmpty()) {
                AdminConfig config = new AdminConfig();
                config.setWhatsappNumber("919876543210");
                configRepo.save(config);
                logger.info("✅ Default WhatsApp config created");
            }
        };
    }
}
