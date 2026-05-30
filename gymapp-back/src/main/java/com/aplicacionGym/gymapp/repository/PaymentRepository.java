package com.aplicacionGym.gymapp.repository;

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

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE MONTH(p.date) = :month")
    Double sumAmountByMonth(@Param("month") int month);

    Optional<Payment> findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(Long clientId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.monthlyType JOIN FETCH p.client WHERE p.client.id IN :clientIds AND p.monthlyType IS NOT NULL AND p.date = (SELECT MAX(p2.date) FROM Payment p2 WHERE p2.client = p.client AND p2.monthlyType IS NOT NULL)")
    List<Payment> findLatestMonthlyPaymentsByClientIds(@Param("clientIds") List<Long> clientIds);

}
