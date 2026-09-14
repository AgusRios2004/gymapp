package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Product;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.repository.AdministratorRepository;
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
 * Tests rojos de la spec 0002: quién cobra en pagos de productos y de cuotas sale del token,
 * no del idProfessor que manda el front.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PaymentStaffFromSessionTest {

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
    private ProductRepository productRepository;

    private Client saveClient(String dni) {
        Client client = new Client();
        client.setName("Nora");
        client.setLastName("Vega");
        client.setDni(dni);
        client.setPhone("1177889900");
        client.setEmail(dni + "@clientes.test");
        client.setPassword("x");
        client.setActive(true);
        return clientRepository.save(client);
    }

    private Professor saveProfessor(String dni, boolean active) {
        Professor professor = new Professor();
        professor.setName("Hugo");
        professor.setLastName("Ibarra");
        professor.setDni(dni);
        professor.setPhone("1188990011");
        professor.setEmail(dni + "@profesores.test");
        professor.setPassword("x");
        professor.setActive(active);
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

    private Map<String, Object> productPaymentBody(Long idClient, Long idProfessor, Long idProduct, int quantity) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("idProduct", idProduct);
        item.put("quantity", quantity);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", idClient);
        if (idProfessor != null) {
            body.put("idProfessor", idProfessor);
        }
        body.put("date", LocalDate.now().toString());
        body.put("products", List.of(item));
        return body;
    }

    private Map<String, Object> monthlyPaymentBody(Long idClient, Long idProfessor, Long idMonthlyType) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", idClient);
        if (idProfessor != null) {
            body.put("idProfessor", idProfessor);
        }
        body.put("idMonthlyType", idMonthlyType);
        body.put("date", LocalDate.now().toString());
        return body;
    }

    // AC-0002-01: PROFESSOR sin idProfessor en el body. El pago queda a nombre del profesor del token.
    @Test
    void createProductPayment_asProfessorWithoutIdProfessor_respondsOkWithTokenProfessorAsOwner() throws Exception {
        Professor tokenProfessor = saveProfessor("91200001", true);
        Client client = saveClient("60200001");
        Product product = saveProduct("Proteina", 15000, 10);

        Map<String, Object> body = productPaymentBody(client.getId(), null, product.getId(), 1);

        MvcResult result = mockMvc.perform(post("/api/payments/product")
                        .with(user(tokenProfessor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        assertThat(data.get("idProfessor").asLong()).isEqualTo(tokenProfessor.getId());
    }

    // AC-0002-02: PROFESSOR A manda el idProfessor del PROFESSOR B; el backend lo ignora y el pago
    // queda a nombre de A.
    @Test
    void createProductPayment_asProfessorWithOtherProfessorIdInBody_ignoresBodyAndKeepsTokenProfessor() throws Exception {
        Professor professorA = saveProfessor("91200002", true);
        Professor professorB = saveProfessor("91200003", true);
        Client client = saveClient("60200002");
        Product product = saveProduct("Creatina", 8000, 10);

        Map<String, Object> body = productPaymentBody(client.getId(), professorB.getId(), product.getId(), 1);

        MvcResult result = mockMvc.perform(post("/api/payments/product")
                        .with(user(professorA.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        assertThat(data.get("idProfessor").asLong()).isEqualTo(professorA.getId());
    }

    // AC-0002-03: ADMIN elige un profesor existente y activo; el pago queda a nombre de ese profesor.
    @Test
    void createProductPayment_asAdminWithExistingActiveProfessor_respondsOkWithChosenProfessor() throws Exception {
        Administrator admin = saveAdministrator("70200001");
        Professor chosenProfessor = saveProfessor("91200004", true);
        Client client = saveClient("60200003");
        Product product = saveProduct("Barra proteica", 1200, 10);

        Map<String, Object> body = productPaymentBody(client.getId(), chosenProfessor.getId(), product.getId(), 1);

        MvcResult result = mockMvc.perform(post("/api/payments/product")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        assertThat(data.get("idProfessor").asLong()).isEqualTo(chosenProfessor.getId());
    }

    // AC-0002-04: ADMIN sin idProfessor responde 400 en español pidiendo elegir el profesor, y el
    // stock del pedido no cambia.
    @Test
    void createProductPayment_asAdminWithoutIdProfessor_respondsBadRequestInSpanishAndKeepsStock() throws Exception {
        Administrator admin = saveAdministrator("70200002");
        Client client = saveClient("60200004");
        Product product = saveProduct("Shaker", 5000, 10);

        Map<String, Object> body = productPaymentBody(client.getId(), null, product.getId(), 1);

        MvcResult result = mockMvc.perform(post("/api/payments/product")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String message = json.get("message").asText();
        assertThat(message.toLowerCase()).contains("profesor");

        assertThat(productRepository.findById(product.getId()).orElseThrow().getStock()).isEqualTo(10);
    }

    // AC-0002-05: ADMIN manda su propio id como idProfessor; responde 404 con el id en el mensaje y
    // el stock no cambia.
    @Test
    void createProductPayment_asAdminWithOwnIdAsProfessor_respondsNotFoundWithIdAndKeepsStock() throws Exception {
        Administrator admin = saveAdministrator("70200003");
        Client client = saveClient("60200005");
        Product product = saveProduct("Guantes", 3000, 10);

        Map<String, Object> body = productPaymentBody(client.getId(), admin.getId(), product.getId(), 1);

        MvcResult result = mockMvc.perform(post("/api/payments/product")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String message = json.get("message").asText();
        assertThat(message).contains(admin.getId().toString());

        assertThat(productRepository.findById(product.getId()).orElseThrow().getStock()).isEqualTo(10);
    }

    // AC-0002-06: PROFESSOR A registra una cuota mandando el idProfessor de B; queda a nombre de A.
    @Test
    void createMonthlyPayment_asProfessorWithOtherProfessorIdInBody_ignoresBodyAndKeepsTokenProfessor() throws Exception {
        Professor professorA = saveProfessor("91200005", true);
        Professor professorB = saveProfessor("91200006", true);
        Client client = saveClient("60200006");
        MonthlyType monthlyType = saveMonthlyType("Plan Full", 22000, 30);

        Map<String, Object> body = monthlyPaymentBody(client.getId(), professorB.getId(), monthlyType.getId());

        MvcResult result = mockMvc.perform(post("/api/payments/monthly")
                        .with(user(professorA.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        assertThat(data.get("idProfessor").asLong()).isEqualTo(professorA.getId());
    }

    // AC-0002-07: ADMIN sin idProfessor en una cuota responde 400 en español y no persiste ningún pago.
    @Test
    void createMonthlyPayment_asAdminWithoutIdProfessor_respondsBadRequestAndPersistsNothing() throws Exception {
        Administrator admin = saveAdministrator("70200004");
        Client client = saveClient("60200007");
        MonthlyType monthlyType = saveMonthlyType("Plan Basico", 12000, 30);

        long paymentsBefore = paymentRepository.count();

        Map<String, Object> body = monthlyPaymentBody(client.getId(), null, monthlyType.getId());

        MvcResult result = mockMvc.perform(post("/api/payments/monthly")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("message").asText().toLowerCase()).contains("profesor");

        assertThat(paymentRepository.count()).isEqualTo(paymentsBefore);
    }

    // AC-0002-13: ADMIN elige un profesor inactivo, tanto en venta de productos como en cuota; ambos
    // responden 409 y no persisten nada ni descuentan stock.
    @Test
    void createProductPayment_asAdminWithInactiveProfessor_respondsConflictAndKeepsStock() throws Exception {
        Administrator admin = saveAdministrator("70200005");
        Professor inactiveProfessor = saveProfessor("91200007", false);
        Client client = saveClient("60200008");
        Product product = saveProduct("Cinturon", 9000, 10);

        Map<String, Object> body = productPaymentBody(client.getId(), inactiveProfessor.getId(), product.getId(), 1);

        mockMvc.perform(post("/api/payments/product")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.succes").value(false));

        assertThat(productRepository.findById(product.getId()).orElseThrow().getStock()).isEqualTo(10);
    }

    // AC-0002-13: mismo caso pero para el cobro de una cuota.
    @Test
    void createMonthlyPayment_asAdminWithInactiveProfessor_respondsConflictAndPersistsNothing() throws Exception {
        Administrator admin = saveAdministrator("70200006");
        Professor inactiveProfessor = saveProfessor("91200008", false);
        Client client = saveClient("60200009");
        MonthlyType monthlyType = saveMonthlyType("Plan Premium", 30000, 30);

        long paymentsBefore = paymentRepository.count();

        Map<String, Object> body = monthlyPaymentBody(client.getId(), inactiveProfessor.getId(), monthlyType.getId());

        mockMvc.perform(post("/api/payments/monthly")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.succes").value(false));

        assertThat(paymentRepository.count()).isEqualTo(paymentsBefore);
    }

    // AC-0002-14: una persona que no es ADMIN ni PROFESSOR (un Client autenticado) no puede cobrar.
    @Test
    void createProductPayment_asAuthenticatedClient_respondsForbiddenAndPersistsNothing() throws Exception {
        Client authenticatedClient = saveClient("60200010");
        Professor professor = saveProfessor("91200009", true);
        Client targetClient = saveClient("60200011");
        Product product = saveProduct("Termo", 4000, 10);

        long paymentsBefore = paymentRepository.count();

        Map<String, Object> body = productPaymentBody(targetClient.getId(), professor.getId(), product.getId(), 1);

        mockMvc.perform(post("/api/payments/product")
                        .with(user(authenticatedClient.getEmail()).password("x").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());

        assertThat(paymentRepository.count()).isEqualTo(paymentsBefore);
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStock()).isEqualTo(10);
    }
}
