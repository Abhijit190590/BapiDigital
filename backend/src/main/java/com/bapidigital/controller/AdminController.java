package com.bapidigital.controller;

import com.bapidigital.model.AdminConfig;
import com.bapidigital.model.Product;
import com.bapidigital.service.AdminConfigService;
import com.bapidigital.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final ProductService productService;
    private final AdminConfigService configService;

    public AdminController(ProductService productService, AdminConfigService configService) {
        this.productService = productService;
        this.configService = configService;
    }

    // ========== Product Management ==========

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody Product product) {
        try {
            return ResponseEntity.ok(productService.updateProduct(id, product));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    // ========== WhatsApp Config ==========

    @PutMapping("/config/whatsapp")
    public ResponseEntity<AdminConfig> updateWhatsApp(@RequestBody Map<String, String> body) {
        String number = body.get("whatsappNumber");
        return ResponseEntity.ok(configService.updateWhatsAppNumber(number));
    }

    // ========== Dashboard Stats ==========

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long productCount = productService.getProductCount();
        String whatsapp = configService.getWhatsAppNumber();
        return ResponseEntity.ok(Map.of(
                "totalProducts", productCount,
                "whatsappNumber", whatsapp
        ));
    }
}
