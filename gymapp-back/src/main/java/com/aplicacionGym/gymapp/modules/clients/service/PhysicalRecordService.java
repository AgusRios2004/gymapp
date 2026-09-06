package com.aplicacionGym.gymapp.modules.clients.service;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.clients.entity.PhysicalRecord;
import com.aplicacionGym.gymapp.modules.clients.repository.ClientRepository;
import com.aplicacionGym.gymapp.modules.clients.repository.PhysicalRecordRepository;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;

import com.aplicacionGym.gymapp.modules.clients.dto.request.PhysicalRecordRequestDTO;
import com.aplicacionGym.gymapp.modules.clients.dto.response.PhysicalRecordResponseDTO;
import com.aplicacionGym.gymapp.modules.clients.mapper.PhysicalRecordMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhysicalRecordService {

    private final PhysicalRecordRepository physicalRecordRepository;
    private final ClientRepository clientRepository;
    private final PhysicalRecordMapper physicalRecordMapper;

    public List<PhysicalRecordResponseDTO> getRecordsByClient(Long clientId) {
        return physicalRecordRepository.findByClientIdOrderByDateDesc(clientId)
                .stream()
                .map(physicalRecordMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public PhysicalRecordResponseDTO createRecord(Long clientId, PhysicalRecordRequestDTO recordDTO) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));
        
        PhysicalRecord record = physicalRecordMapper.toEntity(recordDTO);
        record.setClient(client);
        
        PhysicalRecord saved = physicalRecordRepository.save(record);
        return physicalRecordMapper.toResponseDTO(saved);
    }

    public void deleteRecord(Long id) {
        if (!physicalRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("Physical record not found with id: " + id);
        }
        physicalRecordRepository.deleteById(id);
    }
}
