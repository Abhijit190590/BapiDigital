package com.bapidigital.repository;

import com.bapidigital.model.AdminConfig;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdminConfigRepository extends MongoRepository<AdminConfig, String> {
}
