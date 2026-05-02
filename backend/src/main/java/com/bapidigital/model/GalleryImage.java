package com.bapidigital.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "gallery")
public class GalleryImage {
    @Id
    private String id;
    private String imageUrl;
    private String caption;
    private LocalDateTime createdAt = LocalDateTime.now();
}
