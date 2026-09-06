package com.aplicacionGym.gymapp.modules.routines.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.modules.routines.entity.ExerciseLog;
import com.aplicacionGym.gymapp.modules.routines.service.ExerciseLogService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercise-logs")
@ConditionalOnProperty(name = "gym.modules.routines.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ExerciseLogController {

    private final ExerciseLogService exerciseLogService;

    @PostMapping
    public ResponseEntity<WebApiResponse> saveLog(@RequestBody ExerciseLog log) {
        ExerciseLog saved = exerciseLogService.saveLog(log);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Registro de ejercicio guardado", saved));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<WebApiResponse> getLogsByClient(@PathVariable Long clientId) {
        List<ExerciseLog> logs = exerciseLogService.getLogsByClient(clientId);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Registros obtenidos", logs));
    }

    @GetMapping("/client/{clientId}/exercise/{exerciseId}/latest")
    public ResponseEntity<WebApiResponse> getLatestLog(@PathVariable Long clientId, @PathVariable Long exerciseId) {
        return exerciseLogService.getLatestLogForExercise(clientId, exerciseId)
                .map(log -> ResponseEntity.ok(WebApiResponseBuilder.success("Último registro obtenido", log)))
                .orElse(ResponseEntity.ok(WebApiResponseBuilder.success("No hay registros previos", null)));
    }

    @GetMapping("/client/{clientId}/exercise/{exerciseId}/history")
    public ResponseEntity<WebApiResponse> getExerciseHistory(@PathVariable Long clientId, @PathVariable Long exerciseId) {
        List<ExerciseLog> history = exerciseLogService.getHistoryForExercise(clientId, exerciseId);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Historial obtenido", history));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebApiResponse> deleteLog(@PathVariable Long id) {
        exerciseLogService.deleteLog(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Registro eliminado", null));
    }
}
