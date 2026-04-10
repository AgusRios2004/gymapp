package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.ClientRoutine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRoutineRepository extends JpaRepository<ClientRoutine, Long> {
}
