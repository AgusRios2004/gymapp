package com.aplicacionGym.gymapp.modules.payments.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.core.entity.Administrator;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.core.repository.AdministratorRepository;
import com.aplicacionGym.gymapp.modules.payments.entity.Product;
import com.aplicacionGym.gymapp.modules.payments.repository.ProductRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@ConditionalOnProperty(name = "gym.modules.payments.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    private final AdministratorRepository administratorRepository;

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(Product product) {
        Administrator admin = administratorRepository.findById(product.getAdministrator().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Admin not found with id: " + product.getAdministrator().getId()));
        product.setAdministrator(admin);
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product productUpdated) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setProductName(productUpdated.getProductName());
                    product.setAdministrator(productUpdated.getAdministrator());
                    product.setPrice(productUpdated.getPrice());
                    product.setStock(productUpdated.getStock());
                    return productRepository.save(product);
                });
    }

    public void deleteProduct(Long id) {
        productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.deleteById(id);
    }

}
