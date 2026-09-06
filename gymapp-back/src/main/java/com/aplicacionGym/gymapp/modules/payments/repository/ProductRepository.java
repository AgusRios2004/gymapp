package com.aplicacionGym.gymapp.modules.payments.repository;

import com.aplicacionGym.gymapp.modules.payments.entity.Product;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    long countByStockLessThan(int stockLimit);
}
