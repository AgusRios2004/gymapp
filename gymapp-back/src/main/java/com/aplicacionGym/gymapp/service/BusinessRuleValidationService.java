package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class BusinessRuleValidationService {

    @Autowired
    private PaymentRepository paymentRepository;

    public void validateClientAccess(Client client) {
        Payment latestPayment = paymentRepository
                .findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(client.getId())
                .orElseThrow(() -> new RuntimeException("El alumno no tiene una membresía registrada."));

        if (latestPayment.getExpirationDate() != null && latestPayment.getExpirationDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("La membresía del alumno ha vencido el: " + latestPayment.getExpirationDate());
        }

        // Rule: "un alumno no puede registrar asistencia si debe más de 2 meses"
        if (latestPayment.getExpirationDate() != null && latestPayment.getExpirationDate().plusMonths(2).isBefore(LocalDate.now())) {
            throw new RuntimeException("El alumno registra deuda de más de 2 meses.");
        }
    }
}
