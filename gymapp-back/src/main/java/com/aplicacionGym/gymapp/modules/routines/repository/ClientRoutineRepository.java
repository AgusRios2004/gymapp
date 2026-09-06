package com.aplicacionGym.gymapp.modules.routines.repository;

import com.aplicacionGym.gymapp.modules.routines.entity.ClientRoutine;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRoutineRepository extends JpaRepository<ClientRoutine, Long> {
}
