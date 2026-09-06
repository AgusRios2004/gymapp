package com.aplicacionGym.gymapp.modules.attendance.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.attendance.dto.request.AssistanceRequestDTO;
import com.aplicacionGym.gymapp.modules.attendance.dto.response.AssistanceResponseDTO;
import com.aplicacionGym.gymapp.modules.attendance.entity.Assistance;
import com.aplicacionGym.gymapp.modules.attendance.service.AssistanceService;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assistance")
@ConditionalOnProperty(name = "gym.modules.attendance.enabled", havingValue = "true")
@RequiredArgsConstructor
public class AssistanceController {

    private final AssistanceService assistanceService;

    @PostMapping
    public ResponseEntity<WebApiResponse> registerAssistance(@RequestBody AssistanceRequestDTO dto) {
        AssistanceResponseDTO assistance = assistanceService.registerAssistance(dto);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Assistance registered successfully!", assistance));
    }

    @GetMapping("/client/{idClient}")
    public ResponseEntity<WebApiResponse> getAssistanceByClient(@PathVariable Long idClient) {
        List<AssistanceResponseDTO> assistanceList = assistanceService.getAssistanceByClient(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Assistance found successfully!", assistanceList));
    }

    @GetMapping("/date")
    public ResponseEntity<WebApiResponse> getAssistanceByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AssistanceResponseDTO> assistanceList = assistanceService.getAssistanceByDate(date);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Assistance found successfully!", assistanceList));
    }
}
