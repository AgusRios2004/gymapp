package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.request.PhysicalRecordRequestDTO;
import com.aplicacionGym.gymapp.dto.response.PhysicalRecordResponseDTO;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.PhysicalRecord;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.PhysicalRecordMapper;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PhysicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PhysicalRecordService {

    @Autowired
    private PhysicalRecordRepository physicalRecordRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private PhysicalRecordMapper physicalRecordMapper;

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
