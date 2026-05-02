package com.bapidigital.controller;
 
import com.bapidigital.service.AdminConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.Map;
 
@RestController
@RequestMapping("/api/admin/config")
@CrossOrigin
public class AdminConfigController {
 
    private final AdminConfigService configService;
 
    public AdminConfigController(AdminConfigService configService) {
        this.configService = configService;
    }
 
    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(configService.updateSiteSettings(settings));
    }
}
