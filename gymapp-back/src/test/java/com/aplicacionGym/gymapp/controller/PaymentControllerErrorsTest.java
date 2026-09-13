package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.entity.Product;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests rojos de la spec 0001: pagos - plan duplicado como 409, y stock sin descuentos parciales.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class PaymentControllerErrorsTest {

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

    private Client saveClient(String dni) {
        Client client = new Client();
        client.setName("Nora");
        client.setLastName("Vega");
        client.setDni(dni);
        client.setPhone("1177889900");
        client.setActive(true);
        return clientRepository.save(client);
    }

    private Professor saveProfessor(String dni) {
        Professor professor = new Professor();
        professor.setName("Hugo");
        professor.setLastName("Ibarra");
        professor.setDni(dni);
        professor.setPhone("1188990011");
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

    // AC-0001-09: pago del mismo plan que el cliente tiene vigente responde 409 con la fecha de
    // vencimiento del plan actual.
    @Test
    void createMonthlyPayment_forSamePlanAlreadyActive_respondsConflictWithCurrentExpirationDate() throws Exception {
        Client client = saveClient("60111222");
        Professor professor = saveProfessor("91111222");
        MonthlyType monthlyType = saveMonthlyType("Plan Full", 22000, 30);

        LocalDate paymentDate = LocalDate.now().minusDays(5);
        Payment existingPayment = new Payment();
        existingPayment.setClient(client);
        existingPayment.setProfessor(professor);
        existingPayment.setMonthlyType(monthlyType);
        existingPayment.setAmount(monthlyType.getPrice());
        existingPayment.setDate(paymentDate);
        existingPayment.setPaymentType(PaymentType.MONTHLY);
        paymentRepository.save(existingPayment);
        LocalDate currentExpirationDate = paymentDate.plusDays(monthlyType.getDurationDays());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idProfessor", professor.getId());
        body.put("idMonthlyType", monthlyType.getId());
        body.put("date", LocalDate.now().toString());

        MvcResult result = mockMvc.perform(post("/api/payments/monthly")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String message = json.get("message").asText();
        assertThat(message).contains(currentExpirationDate.toString());
    }

    // AC-0001-10: venta con stock insuficiente en un ítem responde 409 y no descuenta stock de
    // ningún producto del pedido, incluidos los que sí tenían stock suficiente.
    @Test
    void createProductPayment_withInsufficientStockOnOneItem_respondsConflictAndKeepsAllStockUntouched() throws Exception {
        Client client = saveClient("60111223");
        Professor professor = saveProfessor("91111223");

        Product sufficientStockProduct = saveProduct("Proteina", 15000, 10);
        Product insufficientStockProduct = saveProduct("Creatina", 8000, 2);

        Map<String, Object> firstItem = new LinkedHashMap<>();
        firstItem.put("idProduct", sufficientStockProduct.getId());
        firstItem.put("quantity", 3);

        Map<String, Object> secondItem = new LinkedHashMap<>();
        secondItem.put("idProduct", insufficientStockProduct.getId());
        secondItem.put("quantity", 5);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idProfessor", professor.getId());
        body.put("date", LocalDate.now().toString());
        body.put("products", List.of(firstItem, secondItem));

        mockMvc.perform(post("/api/payments/product")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.succes").value(false));

        int sufficientStockAfter = productRepository.findById(sufficientStockProduct.getId()).orElseThrow().getStock();
        int insufficientStockAfter = productRepository.findById(insufficientStockProduct.getId()).orElseThrow().getStock();

        assertThat(sufficientStockAfter).isEqualTo(10);
        assertThat(insufficientStockAfter).isEqualTo(2);
    }

    // AC-0001-10 (hallazgo del reviewer): dos líneas del mismo producto que juntas superan el stock
    // también responden 409. Validar línea por línea las dejaba pasar y el stock quedaba negativo.
    @Test
    void createProductPayment_withRepeatedProductExceedingStockInTotal_respondsConflictAndKeepsStock() throws Exception {
        Client client = saveClient("60111224");
        Professor professor = saveProfessor("91111224");
        Product product = saveProduct("Barra proteica", 1200, 5);

        Map<String, Object> firstLine = new LinkedHashMap<>();
        firstLine.put("idProduct", product.getId());
        firstLine.put("quantity", 3);

        Map<String, Object> secondLine = new LinkedHashMap<>();
        secondLine.put("idProduct", product.getId());
        secondLine.put("quantity", 3);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idClient", client.getId());
        body.put("idProfessor", professor.getId());
        body.put("date", LocalDate.now().toString());
        body.put("products", List.of(firstLine, secondLine));

        mockMvc.perform(post("/api/payments/product")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.succes").value(false));

        assertThat(productRepository.findById(product.getId()).orElseThrow().getStock()).isEqualTo(5);
    }
}
