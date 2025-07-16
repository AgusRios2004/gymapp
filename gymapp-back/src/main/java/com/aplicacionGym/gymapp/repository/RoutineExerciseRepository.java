package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.RoutineExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoutineExerciseRepository extends JpaRepository<RoutineExercise, Long> {

    boolean existsByExerciseId(Long idExercise);

}
