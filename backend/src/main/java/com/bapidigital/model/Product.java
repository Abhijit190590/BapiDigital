package com.bapidigital.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String name;

    private double price;

    private String description;

    private List<String> images; // Base64 encoded or URLs

    private String category; // CLOTHES, PHOTOS, STUDIO_ITEMS

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Product() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
