package com.aplicacionGym.gymapp.modules.payments.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.payments.entity.Product;
import com.aplicacionGym.gymapp.modules.payments.service.ProductService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@ConditionalOnProperty(name = "gym.modules.payments.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    private ResponseEntity<WebApiResponse> getAllProducts(){
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Products find successfully", products));
    }

    @GetMapping("/{id}")
    private ResponseEntity<WebApiResponse> getProductsById(@PathVariable Long id){
        Product product = productService.getProductById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: "+id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Product find successfully", product));
    }

    @PostMapping
    private ResponseEntity<WebApiResponse> createProduct(@RequestBody Product product){
        Product productCreated = productService.createProduct(product);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Product created successfully", productCreated));
    }

    @PutMapping("/{id}")
    private ResponseEntity<WebApiResponse> updateProduct(@PathVariable Long id, @RequestBody Product productUpdate){
        Product product = productService.updateProduct(id, productUpdate)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " +id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Product find successfully", product));
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<WebApiResponse> deleteProduct(@PathVariable Long id){
        productService.deleteProduct(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Product delete successfully", null));
    }

}
