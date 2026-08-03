package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaterLogRepository extends JpaRepository<WaterLog, Long> {
    Optional<WaterLog> findByClientIdAndDate(Long clientId, LocalDate date);
    List<WaterLog> findByClientIdOrderByDateDesc(Long clientId);
}
