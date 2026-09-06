package com.aplicacionGym.gymapp.modules.payments.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.payments.entity.MonthlyType;
import com.aplicacionGym.gymapp.modules.payments.repository.MonthlyTypeRepository;
import com.aplicacionGym.gymapp.modules.payments.repository.PaymentRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
@ConditionalOnProperty(name = "gym.modules.payments.enabled", havingValue = "true")
@RequiredArgsConstructor
public class MonthlyTypeService {

    private final MonthlyTypeRepository monthlyTypeRepository;
    private final PaymentRepository paymentRepository;

    public List<MonthlyType> getAllMonthlyType() {
        return monthlyTypeRepository.findAll();
    }

    public Optional<MonthlyType> getMonthlyTypeById(Long id) {
        return monthlyTypeRepository.findById(id);
    }

    public MonthlyType createMonthlyType(MonthlyType monthlyType) {
        return monthlyTypeRepository.save(monthlyType);
    }

    public Optional<MonthlyType> updateMonthlyType(Long id, MonthlyType monthlyTypeUpdate) {
        return monthlyTypeRepository.findById(id)
                .map(monthlyType -> {
                    monthlyType.setType(monthlyTypeUpdate.getType());
                    monthlyType.setPrice(monthlyTypeUpdate.getPrice());
                    return monthlyTypeRepository.save(monthlyType);
                });
    }

    public void deleteMonthlyType(Long id) {
        monthlyTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MonthlyType not found with id: " + id));
        if (paymentRepository.existsByMonthlyTypeId(id)) {
            throw new ResourceNotFoundException("Monthly Type have registers in Payments");
        }
        monthlyTypeRepository.deleteById(id);
    }

}
