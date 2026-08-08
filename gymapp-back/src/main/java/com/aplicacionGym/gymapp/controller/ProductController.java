package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.entity.Product;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<WebApiResponse> getAllProducts(){
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Products find successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebApiResponse> getProductsById(@PathVariable Long id){
        Product product = productService.getProductById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: "+id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Product find successfully", product));
    }

    @PostMapping
    public ResponseEntity<WebApiResponse> createProduct(@RequestBody Product product){
        Product productCreated = productService.createProduct(product);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Product created successfully", productCreated));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebApiResponse> updateProduct(@PathVariable Long id, @RequestBody Product productUpdate){
        Product product = productService.updateProduct(id, productUpdate)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " +id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Product find successfully", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebApiResponse> deleteProduct(@PathVariable Long id){
        productService.deleteProduct(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Product delete successfully", null));
    }

}
