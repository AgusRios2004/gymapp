package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.MonthlyTypeRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MonthlyTypeService {

    @Autowired
    private MonthlyTypeRepository monthlyTypeRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    public List<MonthlyType> getAllMonthlyType(){
        return monthlyTypeRepository.findAll();
    }

    public Optional<MonthlyType> getMonthlyTypeById(Long id){
        return monthlyTypeRepository.findById(id);
    }

    public MonthlyType createMonthlyType(MonthlyType monthlyType){
        return monthlyTypeRepository.save(monthlyType);
    }

    public Optional<MonthlyType> updateMonthlyType(Long id, MonthlyType monthlyTypeUpdate){
        return monthlyTypeRepository.findById(id)
            .map(monthlyType -> {
               monthlyType.setType(monthlyTypeUpdate.getType());
               monthlyType.setPrice(monthlyTypeUpdate.getPrice());
               return monthlyTypeRepository.save(monthlyType);
            });
    }

    public void deleteMonthlyType(Long id){
        monthlyTypeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MonthlyType not found with id: "+id));
        if(paymentRepository.existsByMonthlyTypeId(id)){
            throw new ResourceNotFoundException("Monthly Type have registers in Payments");
        }
        monthlyTypeRepository.deleteById(id);
    }

}
