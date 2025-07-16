package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByProfessorId(Long professorId);

    List<Payment> findByClientId(Long clientId);

    Boolean existsByMonthlyTypeId(Long idMonthlyType);

}
