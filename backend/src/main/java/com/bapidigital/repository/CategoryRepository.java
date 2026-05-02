package com.bapidigital.repository;

import com.bapidigital.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findByNameIgnoreCase(String name);
}
