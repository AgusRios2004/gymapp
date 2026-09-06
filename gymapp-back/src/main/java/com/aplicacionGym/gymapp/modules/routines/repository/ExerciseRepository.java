package com.aplicacionGym.gymapp.modules.routines.repository;

import com.aplicacionGym.gymapp.modules.routines.entity.Exercise;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
}
