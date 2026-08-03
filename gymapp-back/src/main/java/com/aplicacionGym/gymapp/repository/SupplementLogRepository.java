package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.SupplementLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplementLogRepository extends JpaRepository<SupplementLog, Long> {
    Optional<SupplementLog> findByClientIdAndDate(Long clientId, LocalDate date);
    List<SupplementLog> findByClientIdOrderByDateDesc(Long clientId);
}
