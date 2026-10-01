package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Product;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.MonthlyTypeRepository;
import com.aplicacionGym.gymapp.repository.ProductRepository;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.Clock;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spec 0013: PaymentResponseDTO con el contrato que ya lee el frontend — {@code paymentType} con el
 * nombre del enum y los productos vendidos en {@code paymentProducts}.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PaymentResponseContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Clock clock;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProfessorRepository professorRepository;

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

    private Professor saveProfessor(String dni) {
        Professor professor = new Professor();
        professor.setName("Hugo");
        professor.setLastName("Ibarra");
        professor.setDni(dni);
        professor.setPhone("1188990011");
        professor.setEmail(dni + "@profesores.test");
        professor.setPassword("x");
        professor.setActive(true);
        return professorRepository.save(professor);
    }

    private MonthlyType saveMonthlyType(String type) {
        return monthlyTypeRepository.save(new MonthlyType(null, type, 20000, 30));
    }

    private Product saveProduct(String name, double price) {
        Product product = new Product();
        product.setProductName(name);
        product.setPrice(price);
        product.setStock(10);
        return productRepository.save(product);
    }

    private Map<String, Object> item(Long idProduct, int quantity) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("idProduct", idProduct);
        item.put("quantity", quantity);
        return item;
    }

    private ResultActions postMonthly(Professor professor, Client client, MonthlyType plan) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idMonthlyType", plan.getId());
        body.put("date", LocalDate.now(clock).toString());

        return mockMvc.perform(post("/api/payments/monthly")
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    private ResultActions postProducts(Professor professor, Client client, List<Map<String, Object>> items) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("date", LocalDate.now(clock).toString());
        body.put("products", items);

        return mockMvc.perform(post("/api/payments/product")
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    private long dataId(ResultActions result) throws Exception {
        String json = result.andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json).get("data").get("id").asLong();
    }

    @Test
    @DisplayName("AC-0013-01: cobrar una cuota responde paymentType MONTHLY y el nombre del plan")
    void ac_0013_01_cobrarUnaCuotaRespondePaymentTypeMonthlyYElNombreDelPlan() throws Exception {
        Professor professor = saveProfessor("95130001");
        Client client = saveClient("61300001");
        MonthlyType plan = saveMonthlyType("Plan Musculación");

        postMonthly(professor, client, plan)
                .andExpect(jsonPath("$.data.paymentType").value("MONTHLY"))
                .andExpect(jsonPath("$.data.monthlyTypeName").value("Plan Musculación"));
    }

    @Test
    @DisplayName("AC-0013-02: vender dos productos responde PRODUCTS y paymentProducts con nombre y cantidad, sin products")
    void ac_0013_02_venderDosProductosRespondeProductsYPaymentProductsSinProducts() throws Exception {
        Professor professor = saveProfessor("95130002");
        Client client = saveClient("61300002");
        Product protein = saveProduct("Proteína 1kg", 15000);
        Product water = saveProduct("Agua 500ml", 800);

        postProducts(professor, client, List.of(item(protein.getId(), 1), item(water.getId(), 3)))
                .andExpect(jsonPath("$.data.paymentType").value("PRODUCTS"))
                .andExpect(jsonPath("$.data.products").doesNotExist())
                .andExpect(jsonPath("$.data.paymentProducts", hasSize(2)))
                .andExpect(jsonPath("$.data.paymentProducts[*].productName",
                        containsInAnyOrder("Proteína 1kg", "Agua 500ml")))
                .andExpect(jsonPath("$.data.paymentProducts[?(@.productName == 'Proteína 1kg')].quantity").value(1))
                .andExpect(jsonPath("$.data.paymentProducts[?(@.productName == 'Agua 500ml')].quantity").value(3));
    }

    @Test
    @DisplayName("AC-0013-03: la lista de pagos distingue la cuota de la venta")
    void ac_0013_03_laListaDePagosDistingueLaCuotaDeLaVenta() throws Exception {
        Professor professor = saveProfessor("95130003");
        Client client = saveClient("61300003");
        MonthlyType plan = saveMonthlyType("Plan Full");
        Product towel = saveProduct("Toalla", 5000);

        long monthlyId = dataId(postMonthly(professor, client, plan));
        long saleId = dataId(postProducts(professor, client, List.of(item(towel.getId(), 1))));

        mockMvc.perform(get("/api/payments")
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == " + monthlyId + ")].paymentType").value("MONTHLY"))
                .andExpect(jsonPath("$.data[?(@.id == " + saleId + ")].paymentType").value("PRODUCTS"))
                .andExpect(jsonPath("$.data[?(@.id == " + saleId + ")].paymentProducts[*]", not(empty())));
    }
}
