package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
