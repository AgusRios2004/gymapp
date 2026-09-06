package com.aplicacionGym.gymapp.modules.clients.mapper;

import com.aplicacionGym.gymapp.modules.clients.dto.request.PhysicalRecordRequestDTO;
import com.aplicacionGym.gymapp.modules.clients.dto.response.PhysicalRecordResponseDTO;
import com.aplicacionGym.gymapp.modules.clients.entity.PhysicalRecord;
import org.springframework.stereotype.Component;

@Component
public class PhysicalRecordMapper {

    public PhysicalRecord toEntity(PhysicalRecordRequestDTO dto) {
        PhysicalRecord entity = new PhysicalRecord();
        entity.setDate(dto.getDate());
        entity.setWeight(dto.getWeight());
        entity.setMuscleMass(dto.getMuscleMass());
        entity.setFatPercentage(dto.getFatPercentage());
        entity.setNotes(dto.getNotes());
        return entity;
    }

    public PhysicalRecordResponseDTO toResponseDTO(PhysicalRecord entity) {
        PhysicalRecordResponseDTO dto = new PhysicalRecordResponseDTO();
        dto.setId(entity.getId());
        dto.setDate(entity.getDate());
        dto.setWeight(entity.getWeight());
        dto.setMuscleMass(entity.getMuscleMass());
        dto.setFatPercentage(entity.getFatPercentage());
        dto.setNotes(entity.getNotes());
        return dto;
    }
}
