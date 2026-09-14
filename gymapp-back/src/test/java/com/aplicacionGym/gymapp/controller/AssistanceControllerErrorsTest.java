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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests rojos de la spec 0001: las reglas de membresía en asistencias responden 409, no 500.
 *
 * Se autentican con un Professor real en H2 (spec 0002: la identidad sale del token, no de
 * @WithMockUser sobre un usuario sin Person detrás).
 */
@SpringBootTest
@AutoConfigureMockMvc
class AssistanceControllerErrorsTest {

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
        client.setName("Lucia");
        client.setLastName("Fernandez");
        client.setDni(dni);
        client.setPhone("1155667788");
        client.setActive(true);
        return clientRepository.save(client);
    }

    private Professor saveProfessor(String dni) {
        Professor professor = new Professor();
        professor.setName("Diego");
        professor.setLastName("Molina");
        professor.setDni(dni);
        professor.setPhone("1166778899");
        professor.setEmail(dni + "@profesores.test");
        professor.setPassword("x");
        professor.setActive(true);
        return professorRepository.save(professor);
    }

    private MonthlyType saveMonthlyType(int durationDays) {
        MonthlyType monthlyType = new MonthlyType();
        monthlyType.setType("Plan Mensual");
        monthlyType.setPrice(15000);
        monthlyType.setDurationDays(durationDays);
        return monthlyTypeRepository.save(monthlyType);
    }

    // AC-0001-07: cliente sin ningún pago de cuota responde 409 con message en español.
    @Test
    void registerAssistance_forClientWithoutAnyMonthlyPayment_respondsConflictInSpanish() throws Exception {
        Client client = saveClient("50111222");
        Professor professor = saveProfessor("90111222");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idProfessor", professor.getId());
        body.put("date", LocalDate.now().toString());
        body.put("inputHour", "09:00:00");

        MvcResult result = mockMvc.perform(post("/api/assistance")
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String message = json.get("message").asText();
        assertThat(message).isNotBlank();
        assertThat(message.toLowerCase()).contains("membres");
    }

    // AC-0001-08: la última cuota del cliente venció ayer; responde 409 y el message contiene esa fecha.
    @Test
    void registerAssistance_forClientWithExpiredMonthlyPayment_respondsConflictWithExpirationDate() throws Exception {
        Client client = saveClient("50111223");
        Professor professor = saveProfessor("90111223");
        MonthlyType monthlyType = saveMonthlyType(30);

        LocalDate expirationDate = LocalDate.now().minusDays(1);
        LocalDate paymentDate = expirationDate.minusDays(monthlyType.getDurationDays());

        Payment payment = new Payment();
        payment.setClient(client);
        payment.setProfessor(professor);
        payment.setMonthlyType(monthlyType);
        payment.setAmount(monthlyType.getPrice());
        payment.setDate(paymentDate);
        payment.setPaymentType(PaymentType.MONTHLY);
        paymentRepository.save(payment);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idProfessor", professor.getId());
        body.put("date", LocalDate.now().toString());
        body.put("inputHour", "09:00:00");

        MvcResult result = mockMvc.perform(post("/api/assistance")
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String message = json.get("message").asText();
        assertThat(message).contains(expirationDate.toString());
    }
}
