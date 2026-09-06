package com.aplicacionGym.gymapp.modules.core.repository;

import com.aplicacionGym.gymapp.modules.core.entity.Professor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    
    List<Professor> findByActiveTrue();

    List<Professor> findByActiveFalse();
}
