package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MealLog;
import com.aplicacionGym.gymapp.entity.NutritionPlan;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.MealLogRepository;
import com.aplicacionGym.gymapp.repository.NutritionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class NutritionService {

    @Autowired
    private NutritionPlanRepository nutritionPlanRepository;
    @Autowired
    private MealLogRepository mealLogRepository;
    @Autowired
    private ClientRepository clientRepository;

    public Optional<NutritionPlan> getActivePlan(Long clientId) {
        return nutritionPlanRepository.findFirstByClientIdAndActiveTrueOrderByIdDesc(clientId);
    }

    public NutritionPlan createPlan(Long clientId, NutritionPlan plan) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));
        plan.setClient(client);
        return nutritionPlanRepository.save(plan);
    }

    public List<MealLog> getMealsByClientAndDate(Long clientId, LocalDate date) {
        return mealLogRepository.findByClientIdAndDate(clientId, date);
    }

    public MealLog logMeal(Long clientId, MealLog mealLog) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));
        mealLog.setClient(client);
        if (mealLog.getDate() == null) {
            mealLog.setDate(LocalDate.now());
        }
        return mealLogRepository.save(mealLog);
    }

    public void deleteMeal(Long mealId) {
        if (!mealLogRepository.existsById(mealId)) {
            throw new ResourceNotFoundException("Meal log not found with id: " + mealId);
        }
        mealLogRepository.deleteById(mealId);
    }
}
