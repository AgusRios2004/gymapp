package com.aplicacionGym.gymapp.modules.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MessagingService {

    public void sendPaymentReminder(String email, String message) {
        log.info("Sending payment reminder EMAIL to: {} | Message: {}", email, message);
        // Simulate email sending
    }

    public void sendWhatsAppReminder(String phoneNumber, String message) {
        log.info("Sending WhatsApp payment reminder to: {} | Message: {}", phoneNumber, message);
        // Simulate WhatsApp API integration (e.g. Twilio API call)
    }
}
