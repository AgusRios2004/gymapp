package com.aplicacionGym.gymapp.repository;

import java.time.LocalDate;

import com.aplicacionGym.gymapp.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByProfessorId(Long professorId);

    List<Payment> findByClientId(Long clientId);

    Boolean existsByMonthlyTypeId(Long idMonthlyType);

    // Rango de fechas y no MONTH(p.date): con solo el mes, septiembre de 2026 sumaba también el de 2025 (spec 0010, BUG-21).
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.date BETWEEN :from AND :to")
    Double sumAmountBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    Optional<Payment> findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(Long clientId);

}
