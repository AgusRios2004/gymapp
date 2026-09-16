package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.entity.Product;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.repository.AssistanceRepository;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.MonthlyTypeRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import com.aplicacionGym.gymapp.repository.ProductRepository;
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
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests rojos de la spec 0004: un cliente inactivo no puede registrar asistencia, pagar una cuota
 * ni comprar productos. Cubre AC-0004-06, AC-0004-07, AC-0004-11.
 *
 * Se autentican con un Professor real en H2, como los tests de errores de la spec 0001/0002.
 */
@SpringBootTest
@AutoConfigureMockMvc
class InactiveClientRulesTest {

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

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AssistanceRepository assistanceRepository;

    private Client saveInactiveClient(String dni) {
        Client client = new Client();
        client.setName("Rocio");
        client.setLastName("Paz");
        client.setDni(dni);
        client.setPhone("1155667788");
        client.setEmail(dni + "@clientes.test");
        client.setPassword("x");
        client.setActive(false);
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

    private MonthlyType saveMonthlyType(String type, double price, int durationDays) {
        MonthlyType monthlyType = new MonthlyType();
        monthlyType.setType(type);
        monthlyType.setPrice(price);
        monthlyType.setDurationDays(durationDays);
        return monthlyTypeRepository.save(monthlyType);
    }

    private Product saveProduct(String name, double price, int stock) {
        Product product = new Product();
        product.setProductName(name);
        product.setPrice(price);
        product.setStock(stock);
        return productRepository.save(product);
    }

    // AC-0004-06: un cliente inactivo con una cuota vigente igual recibe 409 al registrar asistencia
    // (se rechaza por estar inactivo, no por la membresía), y la asistencia no se guarda.
    @Test
    void registerAssistance_forInactiveClientWithActiveMembership_respondsConflictInSpanishAndPersistsNothing() throws Exception {
        Client client = saveInactiveClient("60411001");
        Professor professor = saveProfessor("91411001");
        MonthlyType monthlyType = saveMonthlyType("Plan Full", 15000, 30);

        Payment payment = new Payment();
        payment.setClient(client);
        payment.setProfessor(professor);
        payment.setMonthlyType(monthlyType);
        payment.setAmount(monthlyType.getPrice());
        payment.setDate(LocalDate.now().minusDays(1));
        payment.setPaymentType(PaymentType.MONTHLY);
        paymentRepository.save(payment);

        long assistancesBefore = assistanceRepository.count();

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
        assertThat(message.toLowerCase()).contains("inactivo");

        assertThat(assistanceRepository.count()).isEqualTo(assistancesBefore);
    }

    // AC-0004-07: un cliente inactivo no puede pagar una cuota: 409 en español y ningún pago se
    // persiste.
    @Test
    void createMonthlyPayment_forInactiveClient_respondsConflictInSpanishAndPersistsNothing() throws Exception {
        Client client = saveInactiveClient("60411002");
        Professor professor = saveProfessor("91411002");
        MonthlyType monthlyType = saveMonthlyType("Plan Basico", 12000, 30);

        long paymentsBefore = paymentRepository.count();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idProfessor", professor.getId());
        body.put("idMonthlyType", monthlyType.getId());
        body.put("date", LocalDate.now().toString());

        MvcResult result = mockMvc.perform(post("/api/payments/monthly")
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String message = json.get("message").asText();
        assertThat(message).isNotBlank();
        assertThat(message.toLowerCase()).contains("inactivo");

        assertThat(paymentRepository.count()).isEqualTo(paymentsBefore);
    }

    // AC-0004-11: un cliente inactivo no puede comprar productos: 409 en español, ningún pago se
    // persiste y el stock de los productos no cambia.
    @Test
    void createProductPayment_forInactiveClient_respondsConflictInSpanishAndKeepsStockUntouched() throws Exception {
        Client client = saveInactiveClient("60411003");
        Professor professor = saveProfessor("91411003");
        Product product = saveProduct("Proteina", 15000, 10);

        long paymentsBefore = paymentRepository.count();

        Map<String, Object> item = new LinkedHashMap<>();
        item.put("idProduct", product.getId());
        item.put("quantity", 2);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idProfessor", professor.getId());
        body.put("date", LocalDate.now().toString());
        body.put("products", List.of(item));

        MvcResult result = mockMvc.perform(post("/api/payments/product")
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String message = json.get("message").asText();
        assertThat(message).isNotBlank();
        assertThat(message.toLowerCase()).contains("inactivo");

        assertThat(paymentRepository.count()).isEqualTo(paymentsBefore);
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStock()).isEqualTo(10);
    }
}
