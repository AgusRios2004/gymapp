package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.request.PhysicalRecordRequestDTO;
import com.aplicacionGym.gymapp.dto.response.PhysicalRecordResponseDTO;
import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.service.PhysicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/physical-records")
public class PhysicalRecordController {

    @Autowired
    private PhysicalRecordService physicalRecordService;

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
