package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.MealLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealLogRepository extends JpaRepository<MealLog, Long> {
    List<MealLog> findByClientIdAndDate(Long clientId, LocalDate date);
    List<MealLog> findByClientIdOrderByDateDesc(Long clientId);
}
