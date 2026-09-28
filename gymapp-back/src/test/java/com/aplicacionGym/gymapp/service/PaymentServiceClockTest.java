package com.aplicacionGym.gymapp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aplicacionGym.gymapp.dto.request.MonthlyPaymentRequestDTO;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.exception.BusinessRuleException;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.MonthlyTypeRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import com.aplicacionGym.gymapp.security.AuthenticatedStaffService;

/**
 * Spec 0010: la fecha por defecto del pago y el chequeo de "pago vigente" usan el día de Argentina.
 * En UTC, a las 21:40 del 24/09 el pago quedaba con fecha 25 y un segundo cobro del mismo plan a
 * quien vence el 25 pasaba como si la cuota ya no estuviera vigente.
 */
@ExtendWith(MockitoExtension.class)
class PaymentServiceClockTest {

    // 24/09/2026 21:40 en Argentina.
    @Spy
    private Clock clock = Clock.fixed(Instant.parse("2026-09-25T00:40:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private MonthlyTypeRepository monthlyTypeRepository;
    @Mock
    private AuthenticatedStaffService authenticatedStaffService;

    @InjectMocks
    private PaymentService paymentService;

    private final MonthlyType planFull = new MonthlyType(4L, "Plan Full", 20000, 30);

    @BeforeEach
    void setUp() {
        Professor professor = new Professor(9L, "Hugo", "Ibarra", "91111222", "1188990011", "hugo@gym.com", "x", true);
        Client client = new Client();
        client.setId(1L);
        client.setName("Carlos");
        client.setLastName("Perez");
        client.setActive(true);

        when(authenticatedStaffService.getAuthenticatedPerson()).thenReturn(professor);
        when(authenticatedStaffService.esProfesor(professor)).thenReturn(true);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(monthlyTypeRepository.findById(4L)).thenReturn(Optional.of(planFull));
    }

    @Test
    @DisplayName("AC-0010-06: el pago sin fecha queda con el día local y el mismo plan vigente se rechaza")
    void ac_0010_06_elPagoSinFechaQuedaConElDiaLocalYElMismoPlanVigenteSeRechaza() {
        when(paymentRepository.findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(1L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        paymentService.createMonthlyPayment(new MonthlyPaymentRequestDTO(1L, 4L, null, null));

        ArgumentCaptor<Payment> saved = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(saved.capture());
        assertThat(saved.getValue().getDate()).isEqualTo(LocalDate.of(2026, 9, 24));

        // Cuota del mismo plan pagada el 26/08: vence el 25/09, así que el 24 sigue vigente.
        Payment active = new Payment();
        active.setDate(LocalDate.of(2026, 8, 26));
        active.setMonthlyType(planFull);
        when(paymentRepository.findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(1L)).thenReturn(Optional.of(active));

        assertThatThrownBy(() -> paymentService.createMonthlyPayment(new MonthlyPaymentRequestDTO(1L, 4L, null, null)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Ya existe un pago del plan");
    }
}
