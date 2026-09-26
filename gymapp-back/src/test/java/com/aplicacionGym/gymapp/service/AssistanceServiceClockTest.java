package com.aplicacionGym.gymapp.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.aplicacionGym.gymapp.dto.request.AssistanceRequestDTO;
import com.aplicacionGym.gymapp.entity.Assistance;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.exception.BusinessRuleException;
import com.aplicacionGym.gymapp.repository.AssistanceRepository;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import com.aplicacionGym.gymapp.security.AuthenticatedStaffService;

/**
 * Spec 0010: la cuota que vence hoy no está vencida hasta las 23:59 de Argentina. Con la zona de
 * la JVM en UTC, a las 21:40 el backend ya vivía en el día siguiente y rechazaba la asistencia.
 */
@ExtendWith(MockitoExtension.class)
class AssistanceServiceClockTest {

    private static final ZoneId AR = ZoneId.of("America/Argentina/Buenos_Aires");

    // 24/09/2026 21:40 en Argentina.
    @Spy
    private Clock clock = Clock.fixed(Instant.parse("2026-09-25T00:40:00Z"), AR);

    @Mock
    private AssistanceRepository assistanceRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private AuthenticatedStaffService authenticatedStaffService;

    @InjectMocks
    private AssistanceService assistanceService;

    private final AssistanceRequestDTO request = new AssistanceRequestDTO(1L, null, LocalDate.of(2026, 9, 24), LocalTime.of(21, 40));

    @BeforeEach
    void setUp() {
        Professor staff = new Professor(9L, "Hugo", "Ibarra", "91111222", "1188990011", "hugo@gym.com", "x", true);
        Client client = new Client();
        client.setId(1L);
        client.setName("Carlos");
        client.setActive(true);

        // Cuota de 30 días pagada el 25/08: vence el 24/09.
        Payment payment = new Payment();
        payment.setDate(LocalDate.of(2026, 8, 25));
        payment.setMonthlyType(new MonthlyType(4L, "Plan Full", 20000, 30));

        when(authenticatedStaffService.getAuthenticatedPerson()).thenReturn(staff);
        when(authenticatedStaffService.esAdmin(staff)).thenReturn(false);
        when(authenticatedStaffService.esProfesor(staff)).thenReturn(true);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(paymentRepository.findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(1L)).thenReturn(Optional.of(payment));
    }

    @Test
    @DisplayName("AC-0010-02: la cuota que vence hoy no está vencida a las 21:40, pero sí pasada la medianoche")
    void ac_0010_02_laCuotaQueVenceHoyNoEstaVencidaALas2140PeroSiPasadaLaMedianoche() {
        when(assistanceRepository.save(any(Assistance.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThatCode(() -> assistanceService.registerAssistance(request)).doesNotThrowAnyException();

        // 25/09/2026 00:10 en Argentina: ahora sí venció.
        ReflectionTestUtils.setField(assistanceService, "clock", Clock.fixed(Instant.parse("2026-09-25T03:10:00Z"), AR));
        assertThatThrownBy(() -> assistanceService.registerAssistance(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("ha vencido");
    }
}
