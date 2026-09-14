package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.repository.AdministratorRepository;
import com.aplicacionGym.gymapp.repository.AssistanceRepository;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests rojos de la spec 0002: el staff de una asistencia sale de quien está autenticado, no del
 * idProfessor que manda el front.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AssistanceStaffFromSessionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private MonthlyTypeRepository monthlyTypeRepository;

    @Autowired
    private AssistanceRepository assistanceRepository;

    private Client saveClientWithActiveMembership(String dni, Professor billingProfessor) {
        Client client = new Client();
        client.setName("Lucia");
        client.setLastName("Fernandez");
        client.setDni(dni);
        client.setPhone("1155667788");
        client.setEmail(dni + "@clientes.test");
        client.setPassword("x");
        client.setActive(true);
        Client saved = clientRepository.save(client);

        MonthlyType monthlyType = saveMonthlyType(dni);
        Payment payment = new Payment();
        payment.setClient(saved);
        payment.setProfessor(billingProfessor);
        payment.setMonthlyType(monthlyType);
        payment.setAmount(monthlyType.getPrice());
        payment.setDate(LocalDate.now().minusDays(1));
        payment.setPaymentType(PaymentType.MONTHLY);
        paymentRepository.save(payment);

        return saved;
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

    private Administrator saveAdministrator(String dni) {
        Administrator administrator = new Administrator();
        administrator.setName("Carla");
        administrator.setLastName("Pardo");
        administrator.setDni(dni);
        administrator.setPhone("1199001122");
        administrator.setEmail(dni + "@admins.test");
        administrator.setPassword("x");
        return administratorRepository.save(administrator);
    }

    private MonthlyType saveMonthlyType(String seed) {
        MonthlyType monthlyType = new MonthlyType();
        monthlyType.setType("Plan Mensual " + seed);
        monthlyType.setPrice(15000);
        monthlyType.setDurationDays(30);
        return monthlyTypeRepository.save(monthlyType);
    }

    private Map<String, Object> assistanceBody(Long idClient, Long idProfessor) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", idClient);
        if (idProfessor != null) {
            body.put("idProfessor", idProfessor);
        }
        body.put("date", LocalDate.now().toString());
        body.put("inputHour", "09:00:00");
        return body;
    }

    // AC-0002-08: autenticado como ADMIN, el idProfessor de otra persona en el body se ignora: el
    // staff guardado es el propio admin.
    @Test
    void registerAssistance_asAdminWithOtherPersonIdInBody_savesTokenAdminAsStaff() throws Exception {
        Professor billingProfessor = saveProfessor("91300001");
        Administrator admin = saveAdministrator("70300001");
        Professor otherPersonInBody = saveProfessor("91300002");
        Client client = saveClientWithActiveMembership("60300001", billingProfessor);

        Map<String, Object> body = assistanceBody(client.getId(), otherPersonInBody.getId());

        MvcResult result = mockMvc.perform(post("/api/assistance")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        assertThat(data.get("idProfessor").asLong()).isEqualTo(admin.getId());
    }

    // AC-0002-08: autenticado como PROFESSOR, el idProfessor de otra persona en el body se ignora: el
    // staff guardado es el propio profesor del token.
    @Test
    void registerAssistance_asProfessorWithOtherPersonIdInBody_savesTokenProfessorAsStaff() throws Exception {
        Professor billingProfessor = saveProfessor("91300003");
        Professor tokenProfessor = saveProfessor("91300004");
        Professor otherPersonInBody = saveProfessor("91300005");
        Client client = saveClientWithActiveMembership("60300002", billingProfessor);

        Map<String, Object> body = assistanceBody(client.getId(), otherPersonInBody.getId());

        MvcResult result = mockMvc.perform(post("/api/assistance")
                        .with(user(tokenProfessor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        assertThat(data.get("idProfessor").asLong()).isEqualTo(tokenProfessor.getId());
    }

    // AC-0002-14: una persona que no es ADMIN ni PROFESSOR (un Client autenticado) no puede registrar
    // asistencias.
    @Test
    void registerAssistance_asAuthenticatedClient_respondsForbiddenAndPersistsNothing() throws Exception {
        Professor billingProfessor = saveProfessor("91300006");
        Client authenticatedClient = clientRepository.save(newClient("60300003"));
        Professor professorInBody = saveProfessor("91300007");
        Client targetClient = saveClientWithActiveMembership("60300004", billingProfessor);

        long assistancesBefore = assistanceRepository.count();

        Map<String, Object> body = assistanceBody(targetClient.getId(), professorInBody.getId());

        mockMvc.perform(post("/api/assistance")
                        .with(user(authenticatedClient.getEmail()).password("x").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());

        assertThat(assistanceRepository.count()).isEqualTo(assistancesBefore);
    }

    private Client newClient(String dni) {
        Client client = new Client();
        client.setName("Ana");
        client.setLastName("Suarez");
        client.setDni(dni);
        client.setPhone("1155001122");
        client.setEmail(dni + "@clientes.test");
        client.setPassword("x");
        client.setActive(true);
        return client;
    }
}
