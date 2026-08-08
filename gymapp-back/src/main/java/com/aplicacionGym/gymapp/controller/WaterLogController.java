package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.WaterLog;
import com.aplicacionGym.gymapp.service.WaterLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/clients/{clientId}/water")
@CrossOrigin(origins = "*")
public class WaterLogController {

    @Autowired
    private WaterLogService waterLogService;

    @GetMapping
    public ResponseEntity<WaterLog> getLog(
            @PathVariable Long clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return waterLogService.getLogByDate(clientId, targetDate)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(new WaterLog(null, null, targetDate, 0, 3000, "")));
    }

    @PostMapping("/add")
    public ResponseEntity<WaterLog> addWater(
            @PathVariable Long clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam int amountMl) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(waterLogService.addWater(clientId, targetDate, amountMl));
    }
}
