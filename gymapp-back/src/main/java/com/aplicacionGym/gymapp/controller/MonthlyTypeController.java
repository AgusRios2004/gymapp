package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.service.MonthlyTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monthly-type")
public class MonthlyTypeController {

    @Autowired
    private MonthlyTypeService monthlyTypeService;

    @GetMapping
    private ResponseEntity<WebApiResponse> getAllMonthlyType(){
        List<MonthlyType> monthlyTypes = monthlyTypeService.getAllMonthlyType();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Monthly types find successfully", monthlyTypes));
    }

    @GetMapping("/{id}")
    private ResponseEntity<WebApiResponse> getMonthlyTypeById(@PathVariable Long id){
        MonthlyType monthlyType = monthlyTypeService.getMonthlyTypeById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Monthly type not found with id: " +id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Monthly type find successfully", monthlyType));
    }

    @PostMapping
    private ResponseEntity<WebApiResponse> createMonthlyType(@RequestBody MonthlyType monthlyType){
        MonthlyType monthlyTypeCreated = monthlyTypeService.createMonthlyType(monthlyType);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Monthly type created successfully", monthlyTypeCreated));
    }

    @PutMapping("/{id}")
    private ResponseEntity<WebApiResponse> updateMonthlyType(@PathVariable Long id, @RequestBody MonthlyType monthlyType){
        MonthlyType monthlyTypeUpdated = monthlyTypeService.updateMonthlyType(id, monthlyType)
                .orElseThrow(() -> new ResourceNotFoundException("Monthly type not found with id: " +id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Monthly updated succesfully", monthlyTypeUpdated));
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<WebApiResponse> deleteMonthlyType(@PathVariable Long id){
        monthlyTypeService.deleteMonthlyType(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Monthly Type delete successfully", null));
    }

}
