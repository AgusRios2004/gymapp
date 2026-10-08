package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.MonthlyTypeRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spec 0015 (BUG-22): la fecha escrita dentro de un mensaje de error sale como DD/MM/AAAA, no en
 * ISO. El reloj está fijo para que las fechas de la spec sigan vigentes o vencidas cualquier día.
 */
@SpringBootTest
@AutoConfigureMockMvc
class DateInMessagesTest {

    // 01/10/2026 12:00 en Argentina.
    private static final LocalDate HOY = LocalDate.of(2026, 10, 1);

    @TestConfiguration
    static class FixedClock {
        @Bean
        @Primary
        Clock fixedClock() {
            return Clock.fixed(Instant.parse("2026-10-01T15:00:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private MonthlyTypeRepository monthlyTypeRepository;

    private Client saveClient(String dni) {
        Client client = new Client();
        client.setName("Julia");
        client.setLastName("Acosta");
        client.setDni(dni);
        client.setPhone("1144556677");
        client.setActive(true);
        return clientRepository.save(client);
    }

    private Professor saveProfessor(String dni) {
        Professor professor = new Professor();
        professor.setName("Mario");
        professor.setLastName("Quiroga");
        professor.setDni(dni);
        professor.setPhone("1155667700");
        professor.setEmail(dni + "@profesores.test");
        professor.setPassword("x");
        professor.setActive(true);
        return professorRepository.save(professor);
    }

    // Cuota de 30 días: vence 30 días después de la fecha de pago.
    private MonthlyType savePaidPlan(Client client, Professor cashier, LocalDate paymentDate) {
        MonthlyType plan = monthlyTypeRepository.save(new MonthlyType(null, "Mensual", 20000, 30));
        paymentRepository.save(new Payment(null, client, cashier, plan, 20000, paymentDate, PaymentType.MONTHLY));
        return plan;
    }

    @Test
    @DisplayName("AC-0015-10: el pago duplicado dice hasta cuándo está vigente el plan en DD/MM/AAAA")
    void ac_0015_10_elPagoDuplicadoDiceLaFechaDeVigenciaEnDiaMesAnio() throws Exception {
        Client client = saveClient("61500001");
        Professor professor = saveProfessor("91500001");
        // Pagada el 06/09: vigente hasta el 06/10.
        MonthlyType plan = savePaidPlan(client, professor, LocalDate.of(2026, 9, 6));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idProfessor", professor.getId());
        body.put("idMonthlyType", plan.getId());
        body.put("date", HOY.toString());

        mockMvc.perform(post("/api/payments/monthly")
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Ya existe un pago del plan 'Mensual' vigente hasta 06/10/2026."));
    }

    @Test
    @DisplayName("AC-0015-11: la asistencia con la cuota vencida dice la fecha de vencimiento en DD/MM/AAAA")
    void ac_0015_11_laCuotaVencidaDiceLaFechaDeVencimientoEnDiaMesAnio() throws Exception {
        Client client = saveClient("61500002");
        Professor professor = saveProfessor("91500002");
        // Pagada el 29/08: venció el 28/09.
        savePaidPlan(client, professor, LocalDate.of(2026, 8, 29));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idProfessor", professor.getId());
        body.put("date", HOY.toString());
        body.put("inputHour", "09:00:00");

        mockMvc.perform(post("/api/assistance")
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("La membresía del alumno ha vencido el: 28/09/2026"));
    }
}
