package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.SupplementLog;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.SupplementLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class SupplementService {

    @Autowired
    private SupplementLogRepository supplementLogRepository;
    @Autowired
    private ClientRepository clientRepository;

    public Optional<SupplementLog> getLogByDate(Long clientId, LocalDate date) {
        return supplementLogRepository.findByClientIdAndDate(clientId, date);
    }

    public SupplementLog updateOrCreateLog(Long clientId, SupplementLog logData) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));

        LocalDate targetDate = logData.getDate() != null ? logData.getDate() : LocalDate.now();

        SupplementLog log = supplementLogRepository.findByClientIdAndDate(clientId, targetDate)
                .orElseGet(() -> {
                    SupplementLog newLog = new SupplementLog();
                    newLog.setClient(client);
                    newLog.setDate(targetDate);
                    return newLog;
                });

        log.setCreatineTaken(logData.isCreatineTaken());
        log.setProteinTaken(logData.isProteinTaken());
        log.setNotes(logData.getNotes());

        return supplementLogRepository.save(log);
    }
}
