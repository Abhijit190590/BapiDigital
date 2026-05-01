package com.bapidigital.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "admin_config")
public class AdminConfig {

    @Id
    private String id;

    private String whatsappNumber;
}
