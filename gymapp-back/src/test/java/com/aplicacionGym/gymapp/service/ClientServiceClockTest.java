package com.aplicacionGym.gymapp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;

/** Spec 0010: quien vence hoy no es deudor hasta las 23:59 de Argentina (en UTC lo era desde las 21). */
@ExtendWith(MockitoExtension.class)
class ClientServiceClockTest {

    // 24/09/2026 21:40 en Argentina.
    @Spy
    private Clock clock = Clock.fixed(Instant.parse("2026-09-25T00:40:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));

    private final Client client = new Client();

    @BeforeEach
    void setUp() {
        client.setId(1L);
        client.setName("Carlos");
        client.setLastName("Perez");
        client.setActive(true);

        // Cuota de 30 días pagada el 25/08: vence el 24/09, que todavía es hoy.
        Payment payment = new Payment();
        payment.setDate(LocalDate.of(2026, 8, 25));
        payment.setMonthlyType(new MonthlyType(4L, "Plan Full", 20000, 30));
        when(paymentRepository.findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(1L)).thenReturn(Optional.of(payment));
    }

    @Mock
    private ClientRepository clientRepository;
    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private ClientService clientService;

    @Test
    @DisplayName("AC-0010-03: quien vence hoy no es deudor a las 21:40, ni en la lista ni en la ficha")
    void ac_0010_03_quienVenceHoyNoEsDeudorALas2140NiEnLaListaNiEnLaFicha() {
        when(clientRepository.findByActiveTrue()).thenReturn(List.of(client));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        assertThat(clientService.getActiveClients().get(0).isDebtor()).isFalse();
        assertThat(clientService.getClientById(1L).orElseThrow().isDebtor()).isFalse();
    }
}
