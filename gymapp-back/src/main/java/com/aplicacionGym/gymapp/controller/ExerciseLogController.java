package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.entity.ExerciseLog;
import com.aplicacionGym.gymapp.service.ExerciseLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercise-logs")
public class ExerciseLogController {

    @Autowired
    private ExerciseLogService exerciseLogService;

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
