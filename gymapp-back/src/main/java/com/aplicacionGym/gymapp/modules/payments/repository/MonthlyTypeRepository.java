package com.aplicacionGym.gymapp.modules.payments.repository;

import com.aplicacionGym.gymapp.modules.payments.entity.MonthlyType;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MonthlyTypeRepository extends JpaRepository<MonthlyType, Long> {
}
