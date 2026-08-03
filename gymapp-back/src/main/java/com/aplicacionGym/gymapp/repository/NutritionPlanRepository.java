package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.NutritionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long> {
    List<NutritionPlan> findByClientId(Long clientId);
    Optional<NutritionPlan> findFirstByClientIdAndActiveTrueOrderByIdDesc(Long clientId);
}
