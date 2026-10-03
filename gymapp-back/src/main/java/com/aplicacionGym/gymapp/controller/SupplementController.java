package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.SupplementLogResponseDTO;
import com.aplicacionGym.gymapp.entity.SupplementLog;
import com.aplicacionGym.gymapp.mapper.HabitLogMapper;
import com.aplicacionGym.gymapp.service.SupplementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Clock;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/clients/{clientId}/supplements")
@CrossOrigin(origins = "*")
public class SupplementController {

    @Autowired
    private SupplementService supplementService;

    // Reloj del negocio (spec 0010, ADR-0011): "hoy" en hora argentina, no en la zona de la JVM.
    @Autowired
    private Clock clock;

    @GetMapping
    public ResponseEntity<SupplementLogResponseDTO> getLog(
            @PathVariable Long clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now(clock);
        return supplementService.getLogByDate(clientId, targetDate)
                .map(HabitLogMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(HabitLogMapper.emptySupplementLog(clientId, targetDate)));
    }

    @PostMapping
    public ResponseEntity<SupplementLogResponseDTO> saveLog(@PathVariable Long clientId, @RequestBody SupplementLog logData) {
        return ResponseEntity.ok(HabitLogMapper.toDTO(supplementService.updateOrCreateLog(clientId, logData)));
    }
}
