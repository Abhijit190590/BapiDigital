package com.bapidigital.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@Document(collection = "admin_users")
public class AdminUser {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String password;

    private String role;
}
