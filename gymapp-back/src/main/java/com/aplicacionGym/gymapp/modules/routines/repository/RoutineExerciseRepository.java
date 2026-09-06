package com.aplicacionGym.gymapp.modules.routines.repository;

import com.aplicacionGym.gymapp.modules.routines.entity.RoutineExercise;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoutineExerciseRepository extends JpaRepository<RoutineExercise, Long> {

    boolean existsByExerciseId(Long idExercise);

}
