package com.bapidigital.service;

import com.bapidigital.model.AdminConfig;
import com.bapidigital.repository.AdminConfigRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminConfigService {

    private final AdminConfigRepository configRepository;

    public AdminConfigService(AdminConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    public String getWhatsAppNumber() {
        List<AdminConfig> configs = configRepository.findAll();
        if (configs.isEmpty()) {
            return "919876543210"; // default
        }
        return configs.get(0).getWhatsappNumber();
    }

    public AdminConfig updateWhatsAppNumber(String number) {
        List<AdminConfig> configs = configRepository.findAll();
        AdminConfig config;
        if (configs.isEmpty()) {
            config = new AdminConfig();
        } else {
            config = configs.get(0);
        }
        config.setWhatsappNumber(number);
        return configRepository.save(config);
    }
}
