package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.MealLogResponseDTO;
import com.aplicacionGym.gymapp.dto.response.NutritionPlanResponseDTO;
import com.aplicacionGym.gymapp.entity.MealLog;
import com.aplicacionGym.gymapp.entity.NutritionPlan;
import com.aplicacionGym.gymapp.mapper.NutritionMapper;
import com.aplicacionGym.gymapp.service.NutritionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/clients/{clientId}/nutrition")
@CrossOrigin(origins = "*")
public class NutritionController {

    @Autowired
    private NutritionService nutritionService;

    // Reloj del negocio (spec 0010, ADR-0011): "hoy" en hora argentina, no en la zona de la JVM.
    @Autowired
    private Clock clock;

    @GetMapping("/plan")
    public ResponseEntity<NutritionPlanResponseDTO> getActivePlan(@PathVariable Long clientId) {
        return nutritionService.getActivePlan(clientId)
                .map(NutritionMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/plan")
    public ResponseEntity<NutritionPlanResponseDTO> createPlan(@PathVariable Long clientId, @RequestBody NutritionPlan plan) {
        return ResponseEntity.ok(NutritionMapper.toDTO(nutritionService.createPlan(clientId, plan)));
    }

    @GetMapping("/meals")
    public ResponseEntity<List<MealLogResponseDTO>> getMeals(
            @PathVariable Long clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now(clock);
        return ResponseEntity.ok(nutritionService.getMealsByClientAndDate(clientId, targetDate).stream()
                .map(NutritionMapper::toDTO)
                .toList());
    }

    @PostMapping("/meals")
    public ResponseEntity<MealLogResponseDTO> logMeal(@PathVariable Long clientId, @RequestBody MealLog mealLog) {
        return ResponseEntity.ok(NutritionMapper.toDTO(nutritionService.logMeal(clientId, mealLog)));
    }

    @DeleteMapping("/meals/{mealId}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Long clientId, @PathVariable Long mealId) {
        nutritionService.deleteMeal(mealId);
        return ResponseEntity.noContent().build();
    }
}
