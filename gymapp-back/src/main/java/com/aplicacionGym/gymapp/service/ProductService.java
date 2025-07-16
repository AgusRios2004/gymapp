package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Product;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.AdministratorRepository;
import com.aplicacionGym.gymapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

     @Autowired
     private AdministratorRepository administratorRepository;

    public Optional<Product> getProductById(Long id){
        return productRepository.findById(id);
    }

    public List<Product> getAllProducts(){
        return productRepository.findAll();
    }

    public Product createProduct(Product product){
        Administrator admin = administratorRepository.findById(product.getAdministrator().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " +product.getAdministrator().getId()));
        product.setAdministrator(admin);
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product productUpdated){
        return productRepository.findById(id)
            .map(product -> {
                product.setProductName(productUpdated.getProductName());
                product.setAdministrator(productUpdated.getAdministrator());
                product.setPrice(productUpdated.getPrice());
                return product;
            });
    }

    public void deleteProduct(Long id){
        productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: "+id));
        productRepository.deleteById(id);
    }


}
