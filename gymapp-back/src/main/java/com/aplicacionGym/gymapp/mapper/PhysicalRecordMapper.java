package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.request.PhysicalRecordRequestDTO;
import com.aplicacionGym.gymapp.dto.response.PhysicalRecordResponseDTO;
import com.aplicacionGym.gymapp.entity.PhysicalRecord;
import org.springframework.stereotype.Component;

@Component
public class PhysicalRecordMapper {

    public PhysicalRecord toEntity(PhysicalRecordRequestDTO dto) {
        PhysicalRecord entity = new PhysicalRecord();
        entity.setDate(dto.getDate());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
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
        dto.setHeight(entity.getHeight());
        dto.setBmi(entity.getBmi());
        dto.setMuscleMass(entity.getMuscleMass());
        dto.setFatPercentage(entity.getFatPercentage());
        dto.setNotes(entity.getNotes());
        return dto;
    }
}
