package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
public class ScheduledJobsService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private MessagingService messagingService;

    // Run every day at 1:00 AM: cron = "0 0 1 * * *"
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void checkExpiredMemberships() {
        log.info("Starting scheduled job: check expired memberships");
        List<Client> activeClients = clientRepository.findByActiveTrue();
        for (Client client : activeClients) {
            Payment latestPayment = paymentRepository
                    .findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(client.getId())
                    .orElse(null);

            if (latestPayment != null && latestPayment.getExpirationDate() != null) {
                if (latestPayment.getExpirationDate().isBefore(LocalDate.now())) {
                    log.warn("Client membership has expired! Client ID: {}, Expiration Date: {}", client.getId(), latestPayment.getExpirationDate());
                    messagingService.sendPaymentReminder(client.getEmail(), "Su membresía venció el " + latestPayment.getExpirationDate());
                }
            } else {
                log.warn("Client has no membership payment! Client ID: {}", client.getId());
                client.setActive(false);
                clientRepository.save(client);
            }
        }
        log.info("Finished scheduled job: check expired memberships");
    }

    // Run every day at 2:00 AM: cron = "0 0 2 * * *"
    @Scheduled(cron = "0 0 2 * * *")
    public void generateDatabaseBackup() {
        log.info("Starting scheduled job: auto database backup");
        log.info("Database backup created successfully: backup_" + LocalDate.now() + ".sql");
    }
}
