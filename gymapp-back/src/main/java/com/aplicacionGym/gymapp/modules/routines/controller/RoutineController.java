package com.aplicacionGym.gymapp.modules.routines.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.modules.routines.dto.request.AssignRoutineRequestDTO;
import com.aplicacionGym.gymapp.modules.routines.dto.request.RoutineRequestDTO;
import com.aplicacionGym.gymapp.modules.routines.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.modules.routines.entity.Routine;
import com.aplicacionGym.gymapp.modules.routines.service.RoutineService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routines")
@ConditionalOnProperty(name = "gym.modules.routines.enabled", havingValue = "true")
@RequiredArgsConstructor
public class RoutineController {

    private final RoutineService routineService;

    @PostMapping("/assign")
    public ResponseEntity<WebApiResponse> assignComplexRoutine(@RequestBody AssignRoutineRequestDTO request) {
        routineService.assignComplexRoutine(request);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine assigned successfully with schedule", null));
    }

    @PostMapping
    public ResponseEntity<WebApiResponse> createRoutine(@RequestBody RoutineRequestDTO routineRequestDTO){
        RoutineResponseDTO routine = routineService.createRoutine(routineRequestDTO);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine created successfully", routine));
    }

    @GetMapping
    public ResponseEntity<WebApiResponse> getALLRoutines(){
        List<RoutineResponseDTO> routines = routineService.getAllRoutines();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routines founds successfully", routines));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebApiResponse> getRoutineById(@PathVariable Long id){
        RoutineResponseDTO routine = routineService.getRoutineById(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine found successfully", routine));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebApiResponse> updateRoutine(@PathVariable Long id, @RequestBody RoutineRequestDTO routineRequestDTO){
        RoutineResponseDTO routineUpdated = routineService.updateRoutine(id, routineRequestDTO);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine updated successfully", routineUpdated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebApiResponse> deleteRoutine(@PathVariable Long id){
        routineService.deleteRoutine(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine deleted successfully", null));
    }

}

