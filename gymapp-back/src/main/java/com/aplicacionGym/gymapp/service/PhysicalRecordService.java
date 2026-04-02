package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.PhysicalRecord;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PhysicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PhysicalRecordService {

    @Autowired
    private PhysicalRecordRepository physicalRecordRepository;
    @Autowired
    private ClientRepository clientRepository;

    public List<PhysicalRecord> getRecordsByClient(Long clientId) {
        return physicalRecordRepository.findByClientIdOrderByDateDesc(clientId);
    }

    public PhysicalRecord createRecord(Long clientId, PhysicalRecord record) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));
        record.setClient(client);
        return physicalRecordRepository.save(record);
    }
}
