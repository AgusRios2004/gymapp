package com.aplicacionGym.gymapp.modules.routines.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.routines.entity.Exercise;
import com.aplicacionGym.gymapp.modules.routines.entity.RoutineExercise;
import com.aplicacionGym.gymapp.modules.routines.repository.ExerciseRepository;
import com.aplicacionGym.gymapp.modules.routines.repository.RoutineExerciseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
@ConditionalOnProperty(name = "gym.modules.routines.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    @Autowired
    RoutineExerciseRepository routineExerciseRepository;

    @Cacheable(value = "exercises")
    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    @Cacheable(value = "exercise", key = "#id")
    public Optional<Exercise> getExerciseById(Long id) {
        return exerciseRepository.findById(java.util.Objects.requireNonNull(id));
    }

    @CacheEvict(value = {"exercises", "exercise"}, allEntries = true)
    public Exercise createExercise(Exercise exercise) {
        return exerciseRepository.save(java.util.Objects.requireNonNull(exercise));
    }

    @CacheEvict(value = {"exercises", "exercise"}, allEntries = true)
    public Optional<Exercise> updateExercise(Long id, Exercise exercise) {
        return exerciseRepository.findById(java.util.Objects.requireNonNull(id))
                .map(exerciseCreated -> {
                    exerciseCreated.setName(exercise.getName());
                    exerciseCreated.setDescription(exercise.getDescription());
                    exerciseCreated.setMuscleGroup(exercise.getMuscleGroup());
                    return exerciseRepository.save(exerciseCreated);
                });
    }

    @CacheEvict(value = {"exercises", "exercise"}, allEntries = true)
    public void deleteExercise(Long id) {
        java.util.Objects.requireNonNull(id);
        if (isExerciseInUse(id)) {
            throw new ResourceNotFoundException("Exercise in use in some RoutineExercise");
        }
        if (!exerciseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Exercise not exists");
        }
        exerciseRepository.deleteById(id);
    }

    public boolean isExerciseInUse(Long idExercise) {
        return routineExerciseRepository.existsByExerciseId(idExercise);
    }

}
