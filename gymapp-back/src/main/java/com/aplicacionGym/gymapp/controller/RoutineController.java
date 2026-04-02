package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.request.RoutineRequestDTO;
import com.aplicacionGym.gymapp.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.service.RoutineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    @Autowired
    private RoutineService routineService;

    @PostMapping
    private ResponseEntity<WebApiResponse> createRoutine(@RequestBody RoutineRequestDTO routineRequestDTO){
        RoutineResponseDTO routine = routineService.createRoutine(routineRequestDTO);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine created successfully", routine));
    }

    @GetMapping
    private ResponseEntity<WebApiResponse> getALLRoutines(){
        List<RoutineResponseDTO> routines = routineService.getAllRoutines();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routines founds successfully", routines));
    }

    @GetMapping("/{id}")
    private ResponseEntity<WebApiResponse> getRoutineById(@PathVariable Long id){
        RoutineResponseDTO routine = routineService.getRoutineById(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine found successfully", routine));
    }

    @PutMapping("/{id}")
    private ResponseEntity<WebApiResponse> updateRoutine(@PathVariable Long id, @RequestBody RoutineRequestDTO routineRequestDTO){
        RoutineResponseDTO routineUpdated = routineService.updateRoutine(id, routineRequestDTO);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine updated successfully", routineUpdated));
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<WebApiResponse> deleteRoutine(@PathVariable Long id){
        routineService.deleteRoutine(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine deleted successfully", null));
    }

}
