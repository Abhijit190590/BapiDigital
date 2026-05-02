package com.bapidigital.service;

import com.bapidigital.model.Product;
import com.bapidigital.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    public Page<Product> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findAllByOrderByCreatedAtDesc(pageable);
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
        return productRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10)).getContent();
    }

    public Product createProduct(Product product) {
        validateProduct(product);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product updatedProduct) {
        validateProduct(updatedProduct);
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

    private void validateProduct(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new RuntimeException("Product name is required");
        }
        if (product.getPrice() == null || product.getPrice() <= 0) {
            throw new RuntimeException("A valid positive price is required");
        }
        if (product.getCategory() == null || product.getCategory().isBlank()) {
            throw new RuntimeException("Product category is required");
        }
    }
}
