package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.SupplementLog;
import com.aplicacionGym.gymapp.service.SupplementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/clients/{clientId}/supplements")
@CrossOrigin(origins = "*")
public class SupplementController {

    @Autowired
    private SupplementService supplementService;

    @GetMapping
    public ResponseEntity<SupplementLog> getLog(
            @PathVariable Long clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return supplementService.getLogByDate(clientId, targetDate)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(new SupplementLog(null, null, targetDate, false, false, "")));
    }

    @PostMapping
    public ResponseEntity<SupplementLog> saveLog(@PathVariable Long clientId, @RequestBody SupplementLog logData) {
        return ResponseEntity.ok(supplementService.updateOrCreateLog(clientId, logData));
    }
}
