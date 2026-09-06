package com.aplicacionGym.gymapp.modules.core.controller;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.core.dto.request.AdministratorRequestDTO;
import com.aplicacionGym.gymapp.modules.core.dto.response.AdministratorResponseDTO;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.modules.core.entity.Administrator;
import com.aplicacionGym.gymapp.modules.core.service.AdministratorService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/administrators")
@RequiredArgsConstructor
public class AdministratorController {

    private final AdministratorService administratorService;

    @GetMapping
    private ResponseEntity<WebApiResponse> getAllAdministrator(){
        List<AdministratorResponseDTO> administrators = administratorService.getAllAdministrator();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Administrators found successfully!", administrators));
    }

    @GetMapping("/{id}")
    private ResponseEntity<WebApiResponse> getAdministratorById(@PathVariable Long id){
        AdministratorResponseDTO administrator = administratorService.getAdministratorById(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Administrator found successfully!", administrator));
    }

    @PostMapping
    private ResponseEntity<WebApiResponse> createAdministrator(@RequestBody AdministratorRequestDTO administratorRequestDTO){
        AdministratorResponseDTO administrator = administratorService.createAdministrator(administratorRequestDTO);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Administrator created successfully", administrator));
    }

    @PutMapping("/{id}")
    private ResponseEntity<WebApiResponse> updateAdministrator(@PathVariable Long id, @RequestBody AdministratorRequestDTO administratorRequestDTO){
        AdministratorResponseDTO administrator = administratorService.updateAdministrator(id, administratorRequestDTO);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Administrator updated successfully", administrator));
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<WebApiResponse> deleteAdministrator(@PathVariable Long id){
        administratorService.deleteAdministrator(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Administrator deleted successfully", null));
    }

}
