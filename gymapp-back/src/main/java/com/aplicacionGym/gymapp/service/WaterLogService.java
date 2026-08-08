package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.WaterLog;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.WaterLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class WaterLogService {

    @Autowired
    private WaterLogRepository waterLogRepository;
    @Autowired
    private ClientRepository clientRepository;

    public Optional<WaterLog> getLogByDate(Long clientId, LocalDate date) {
        return waterLogRepository.findByClientIdAndDate(clientId, date);
    }

    public WaterLog addWater(Long clientId, LocalDate date, int addedMl) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));

        LocalDate targetDate = date != null ? date : LocalDate.now();

        WaterLog log = waterLogRepository.findByClientIdAndDate(clientId, targetDate)
                .orElseGet(() -> {
                    WaterLog newLog = new WaterLog();
                    newLog.setClient(client);
                    newLog.setDate(targetDate);
                    newLog.setMilliliters(0);
                    newLog.setTargetMilliliters(3000);
                    return newLog;
                });

        log.setMilliliters(Math.max(0, log.getMilliliters() + addedMl));
        return waterLogRepository.save(log);
    }
}
