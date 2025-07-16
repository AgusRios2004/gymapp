package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Exercise;
import com.aplicacionGym.gymapp.exception.ExerciseInUseException;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.ExerciseRepository;
import com.aplicacionGym.gymapp.repository.RoutineExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExerciseService {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    RoutineExerciseRepository routineExerciseRepository;

    public List<Exercise> getAllExercises(){
        return exerciseRepository.findAll();
    }

    public Optional<Exercise> getExerciseById(Long id){
        return exerciseRepository.findById(id);
    }

    public Exercise createExercise(Exercise exercise){
        return exerciseRepository.save(exercise);
    }

    public Optional<Exercise> updateExercise(Long id, Exercise exercise){
        return exerciseRepository.findById(id)
            .map(exerciseCreated -> {
                exerciseCreated.setName(exercise.getName());
                exerciseCreated.setDescription(exercise.getDescription());
                exerciseCreated.setMuscleGroup(exercise.getMuscleGroup());
                return exerciseRepository.save(exerciseCreated);
            });
    }

    public void deleteExercise(Long id){
        if(isExerciseInUse(id)){
            throw new ResourceNotFoundException("Exercise in use in some RoutineExercise");
        }
        if(!exerciseRepository.existsById(id)){
            throw new ResourceNotFoundException("Exercise not exists");
        }
        exerciseRepository.deleteById(id);
    }

    public boolean isExerciseInUse(Long idExercise) {
        return routineExerciseRepository.existsByExerciseId(idExercise);
    }

}
