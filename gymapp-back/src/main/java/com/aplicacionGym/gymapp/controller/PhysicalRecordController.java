package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.entity.PhysicalRecord;
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
        List<PhysicalRecord> records = physicalRecordService.getRecordsByClient(clientId);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Records fetched successfully", records));
    }

    @PostMapping("/client/{clientId}")
    public ResponseEntity<WebApiResponse> createRecord(@PathVariable Long clientId,
            @RequestBody PhysicalRecord record) {
        PhysicalRecord created = physicalRecordService.createRecord(clientId, record);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Record saved successfully", created));
    }
}
