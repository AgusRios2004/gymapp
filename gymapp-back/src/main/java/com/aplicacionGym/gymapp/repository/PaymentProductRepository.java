package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.PaymentProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentProductRepository extends JpaRepository<PaymentProduct, Long> {
    List<PaymentProduct> findByClientId(Long id);
}
