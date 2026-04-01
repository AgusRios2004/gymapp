package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.request.AssistanceRequestDTO;
import com.aplicacionGym.gymapp.dto.response.AssistanceResponseDTO;
import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.service.AssistanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assistance")
public class AssistanceController {

    @Autowired
    private AssistanceService assistanceService;

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
