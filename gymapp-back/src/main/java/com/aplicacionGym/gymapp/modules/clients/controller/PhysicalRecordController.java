package com.aplicacionGym.gymapp.modules.clients.controller;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.clients.entity.PhysicalRecord;
import com.aplicacionGym.gymapp.modules.clients.service.PhysicalRecordService;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;

import com.aplicacionGym.gymapp.modules.clients.dto.request.PhysicalRecordRequestDTO;
import com.aplicacionGym.gymapp.modules.clients.dto.response.PhysicalRecordResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/physical-records")
@RequiredArgsConstructor
public class PhysicalRecordController {

    private final PhysicalRecordService physicalRecordService;

    @GetMapping("/client/{clientId}")
    public ResponseEntity<WebApiResponse> getRecordsByClient(@PathVariable Long clientId) {
        List<PhysicalRecordResponseDTO> records = physicalRecordService.getRecordsByClient(clientId);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Records fetched successfully", records));
    }

    @PostMapping("/client/{clientId}")
    public ResponseEntity<WebApiResponse> createRecord(@PathVariable Long clientId,
            @RequestBody PhysicalRecordRequestDTO recordDTO) {
        PhysicalRecordResponseDTO created = physicalRecordService.createRecord(clientId, recordDTO);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Record saved successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebApiResponse> deleteRecord(@PathVariable Long id) {
        physicalRecordService.deleteRecord(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Record deleted successfully", null));
    }
}
