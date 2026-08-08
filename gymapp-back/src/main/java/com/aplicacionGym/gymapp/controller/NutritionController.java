package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.MealLog;
import com.aplicacionGym.gymapp.entity.NutritionPlan;
import com.aplicacionGym.gymapp.service.NutritionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/clients/{clientId}/nutrition")
@CrossOrigin(origins = "*")
public class NutritionController {

    @Autowired
    private NutritionService nutritionService;

    @GetMapping("/plan")
    public ResponseEntity<NutritionPlan> getActivePlan(@PathVariable Long clientId) {
        return nutritionService.getActivePlan(clientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/plan")
    public ResponseEntity<NutritionPlan> createPlan(@PathVariable Long clientId, @RequestBody NutritionPlan plan) {
        return ResponseEntity.ok(nutritionService.createPlan(clientId, plan));
    }

    @GetMapping("/meals")
    public ResponseEntity<List<MealLog>> getMeals(
            @PathVariable Long clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(nutritionService.getMealsByClientAndDate(clientId, targetDate));
    }

    @PostMapping("/meals")
    public ResponseEntity<MealLog> logMeal(@PathVariable Long clientId, @RequestBody MealLog mealLog) {
        return ResponseEntity.ok(nutritionService.logMeal(clientId, mealLog));
    }

    @DeleteMapping("/meals/{mealId}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Long clientId, @PathVariable Long mealId) {
        nutritionService.deleteMeal(mealId);
        return ResponseEntity.noContent().build();
    }
}
