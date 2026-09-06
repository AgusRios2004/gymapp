package com.aplicacionGym.gymapp.modules.routines.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.routines.entity.Exercise;
import com.aplicacionGym.gymapp.modules.routines.service.ExerciseService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@ConditionalOnProperty(name = "gym.modules.routines.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    public ResponseEntity<WebApiResponse> getAllExercise(){
        List<Exercise> exercises = exerciseService.getAllExercises();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercises found successfully", exercises));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebApiResponse> getExerciseById(@PathVariable Long id){
        Exercise exercise = exerciseService.getExerciseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise with id not found: "));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercise found successfully", exercise));
    }

    @PostMapping
    public ResponseEntity<WebApiResponse> createExercise(@RequestBody Exercise exercise){
        Exercise exerciseCreated = exerciseService.createExercise(exercise);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercise created successfully", exerciseCreated));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebApiResponse> updateExercise(@PathVariable Long id, @RequestBody Exercise exercise){
        Exercise exerciseUpdated = exerciseService.updateExercise(id, exercise)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: "+id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercise updated successfully", exerciseUpdated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebApiResponse> deleteExercise(@PathVariable Long id){
        exerciseService.deleteExercise(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercise deleted successfully", null));
    }

}
