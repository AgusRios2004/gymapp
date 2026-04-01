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

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p WHERE MONTH(p.date) = :month")
    Double sumAmountByMonth(@org.springframework.data.repository.query.Param("month") int month);

}
