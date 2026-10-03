package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.response.MealLogResponseDTO;
import com.aplicacionGym.gymapp.dto.response.NutritionPlanResponseDTO;
import com.aplicacionGym.gymapp.entity.MealLog;
import com.aplicacionGym.gymapp.entity.NutritionPlan;
import org.springframework.stereotype.Component;

/**
 * Spec 0014: las entidades traían el Client completo y, con rutina activa, el ciclo
 * routineActive → clients que dejaba el JSON inválido (BUG-25). Solo viaja el clientId.
 */
@Component
public class NutritionMapper {

    public static NutritionPlanResponseDTO toDTO(NutritionPlan plan) {
        return new NutritionPlanResponseDTO(
                plan.getId(),
                plan.getClient() == null ? null : plan.getClient().getId(),
                plan.getName(),
                plan.getDailyCalories(),
                plan.getProteinGrams(),
                plan.getCarbsGrams(),
                plan.getFatGrams(),
                plan.getGuidelines(),
                plan.isActive());
    }

    public static MealLogResponseDTO toDTO(MealLog meal) {
        return new MealLogResponseDTO(
                meal.getId(),
                meal.getClient() == null ? null : meal.getClient().getId(),
                meal.getDate(),
                meal.getMealType(),
                meal.getDescription(),
                meal.getCalories(),
                meal.getProteinGrams(),
                meal.isHealthySnackReplaced());
    }
}
