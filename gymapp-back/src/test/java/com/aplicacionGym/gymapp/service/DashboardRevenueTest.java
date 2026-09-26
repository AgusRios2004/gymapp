package com.aplicacionGym.gymapp.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.repository.PaymentRepository;

/**
 * Spec 0010 (BUG-21): los ingresos del mes son los del mes y año del reloj del negocio. La consulta
 * filtraba solo MONTH(p.date): septiembre de 2026 sumaba también septiembre de 2025.
 */
@DataJpaTest
@Import({ DashboardService.class, DashboardRevenueTest.FixedClock.class })
class DashboardRevenueTest {

    @TestConfiguration
    static class FixedClock {
        // 30/09/2026 22:00 en Argentina (ya es 01/10 en UTC).
        @Bean
        Clock clock() {
            return Clock.fixed(Instant.parse("2026-10-01T01:00:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));
        }
    }

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DashboardService dashboardService;

    private void pago(double amount, LocalDate date) {
        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setDate(date);
        payment.setPaymentType(PaymentType.MONTHLY);
        paymentRepository.save(payment);
    }

    @Test
    @DisplayName("AC-0010-13: los ingresos del mes son los del mes y año actuales en hora argentina")
    void ac_0010_13_losIngresosDelMesSonLosDelMesYAnioActualesEnHoraArgentina() {
        pago(20000, LocalDate.of(2026, 9, 30));
        pago(10000, LocalDate.of(2025, 9, 10));
        pago(5000, LocalDate.of(2026, 10, 1));

        assertThat(dashboardService.getDashboardStats().getMonthlyRevenue()).isEqualTo(20000.0);
    }
}
