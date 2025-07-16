package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.Routine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineRepository extends JpaRepository<Routine, Long> {
}
