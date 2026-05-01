package com.bapidigital.service;

import com.bapidigital.model.Product;
import com.bapidigital.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.searchProducts(query);
    }

    public List<Product> getRecentProducts() {
        List<Product> all = productRepository.findAllByOrderByCreatedAtDesc();
        return all.size() > 10 ? all.subList(0, 10) : all;
    }

    public Product createProduct(Product product) {
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product updatedProduct) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updatedProduct.getName());
            existing.setPrice(updatedProduct.getPrice());
            existing.setDescription(updatedProduct.getDescription());
            existing.setCategory(updatedProduct.getCategory());
            if (updatedProduct.getImages() != null && !updatedProduct.getImages().isEmpty()) {
                existing.setImages(updatedProduct.getImages());
            }
            existing.setUpdatedAt(LocalDateTime.now());
            return productRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    public long getProductCount() {
        return productRepository.count();
    }
}
