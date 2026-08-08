package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.ExerciseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseLogRepository extends JpaRepository<ExerciseLog, Long> {
    List<ExerciseLog> findByClientId(Long clientId);
    List<ExerciseLog> findByClientIdAndExerciseIdOrderByDateDesc(Long clientId, Long exerciseId);
}
