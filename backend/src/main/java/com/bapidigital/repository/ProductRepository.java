package com.bapidigital.repository;

import com.bapidigital.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByCategoryIgnoreCase(String category);

    List<Product> findAllByOrderByCreatedAtDesc();

    @Query("{ $or: [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } }, " +
           "{ 'category': { $regex: ?0, $options: 'i' } } " +
           "] }")
    List<Product> searchProducts(String query);
}
