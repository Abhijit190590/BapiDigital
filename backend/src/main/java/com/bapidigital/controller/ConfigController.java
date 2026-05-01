package com.bapidigital.controller;

import com.bapidigital.service.AdminConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
@CrossOrigin
public class ConfigController {

    private final AdminConfigService configService;

    public ConfigController(AdminConfigService configService) {
        this.configService = configService;
    }

    @GetMapping("/whatsapp")
    public ResponseEntity<?> getWhatsAppNumber() {
        String number = configService.getWhatsAppNumber();
        return ResponseEntity.ok(Map.of("whatsappNumber", number));
    }
}
