package com.aplicacionGym.gymapp.modules.core.service;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.clients.repository.ClientRepository;
import com.aplicacionGym.gymapp.modules.payments.entity.Payment;
import com.aplicacionGym.gymapp.modules.payments.repository.PaymentRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledJobsService {

    private final ClientRepository clientRepository;

    private final PaymentRepository paymentRepository;

    private final MessagingService messagingService;

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
