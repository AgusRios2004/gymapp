package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.entity.Exercise;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.service.ExerciseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    @Autowired
    private ExerciseService exerciseService;

    @GetMapping
    private ResponseEntity<WebApiResponse> getAllExercise(){
        List<Exercise> exercises = exerciseService.getAllExercises();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercises found successfully", exercises));
    }

    @GetMapping("/{id}")
    private ResponseEntity<WebApiResponse> getExerciseById(@PathVariable Long id){
        Exercise exercise = exerciseService.getExerciseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise with id not found: "));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercise found successfully", exercise));
    }

    @PostMapping
    private ResponseEntity<WebApiResponse> createExercise(@RequestBody Exercise exercise){
        Exercise exerciseCreated = exerciseService.createExercise(exercise);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercise created successfully", exerciseCreated));
    }

    @PutMapping("/{id}")
    private ResponseEntity<WebApiResponse> updateExercise(@PathVariable Long id, @RequestBody Exercise exercise){
        Exercise exerciseUpdated = exerciseService.updateExercise(id, exercise)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: "+id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercise updated successfully", exerciseUpdated));
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<WebApiResponse> deleteExercise(@PathVariable Long id){
        exerciseService.deleteExercise(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Exercise deleted successfully", null));
    }

}
