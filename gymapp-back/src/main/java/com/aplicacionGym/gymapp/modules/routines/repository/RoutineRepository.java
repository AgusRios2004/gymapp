package com.aplicacionGym.gymapp.modules.routines.repository;

import com.aplicacionGym.gymapp.modules.routines.entity.Routine;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineRepository extends JpaRepository<Routine, Long> {
}
