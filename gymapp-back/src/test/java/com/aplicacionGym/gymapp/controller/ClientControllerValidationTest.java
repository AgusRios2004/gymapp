package com.aplicacionGym.gymapp.controller;

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

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests rojos de la spec 0001: alta y edición de clientes con ClientRequestDTO + @Valid.
 * El payload usado es el mismo que arma hoy ClientSchema en gym-frontend/src/types/schema.type.ts
 * (name, lastName, dni, phone, email, active), tal como exige AC-0001-03.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class ClientControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> validClientPayload(String dni) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", "Marina");
        payload.put("lastName", "Suarez");
        payload.put("dni", dni);
        payload.put("phone", "1122334455");
        payload.put("email", "marina.suarez@example.com");
        payload.put("active", true);
        return payload;
    }

    // AC-0001-01: dni vacío responde 400, succes:false, y data.dni dice en español que el DNI es obligatorio.
    @Test
    void createClient_withEmptyDni_respondsBadRequestWithSpanishDniMessage() throws Exception {
        Map<String, Object> payload = validClientPayload("");

        MvcResult result = mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        assertThat(data).isNotNull();
        String dniMessage = data.get("dni").asText();
        assertThat(dniMessage).isNotBlank();
        assertThat(dniMessage.toLowerCase()).contains("obligatorio");
    }

    // AC-0001-02: dni de 7 caracteres y phone de 5 responde 400 con ambas claves en data;
    // el message de phone menciona el mínimo real de 10.
    @Test
    void createClient_withShortDniAndPhone_respondsBadRequestWithBothFieldMessages() throws Exception {
        Map<String, Object> payload = validClientPayload("1234567");
        payload.put("phone", "12345");

        MvcResult result = mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        assertThat(data).isNotNull();
        assertThat(data.has("dni")).isTrue();
        assertThat(data.has("phone")).isTrue();
        assertThat(data.get("phone").asText()).contains("10");
    }

    // AC-0001-03: el payload completo del formulario con un dni válido responde 200 y persiste esos
    // campos: un GET /api/clients/{id} posterior los devuelve iguales.
    @Test
    void createClient_withFullFormPayload_persistsAndRoundTripsThroughGet() throws Exception {
        Map<String, Object> payload = validClientPayload("20111222");

        MvcResult createResult = mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode created = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("data");
        long id = created.get("id").asLong();

        mockMvc.perform(get("/api/clients/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Marina"))
                .andExpect(jsonPath("$.data.lastName").value("Suarez"))
                .andExpect(jsonPath("$.data.dni").value("20111222"))
                .andExpect(jsonPath("$.data.phone").value("1122334455"))
                .andExpect(jsonPath("$.data.email").value("marina.suarez@example.com"))
                .andExpect(jsonPath("$.data.active").value(true));
    }

    // AC-0001-04: PUT con dni de 9 caracteres responde 400 y el cliente en base no cambia.
    @Test
    void updateClient_withNineDigitDni_respondsBadRequestAndLeavesClientUnchanged() throws Exception {
        Map<String, Object> payload = validClientPayload("30111222");
        MvcResult createResult = mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andReturn();
        long id = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        Map<String, Object> invalidUpdate = validClientPayload("301112223");
        mockMvc.perform(put("/api/clients/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUpdate)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/clients/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.dni").value("30111222"));
    }

    // AC-0001-13: name "Ana" y lastName "Gil" responden 200; name "A" responde 400 con data.name en español.
    @Test
    void createClient_withTwoCharacterNames_isAccepted_andSingleCharacterIsRejected() throws Exception {
        Map<String, Object> shortNamesPayload = validClientPayload("40111222");
        shortNamesPayload.put("name", "Ana");
        shortNamesPayload.put("lastName", "Gil");

        mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortNamesPayload)))
                .andExpect(status().isOk());

        Map<String, Object> oneCharPayload = validClientPayload("40111223");
        oneCharPayload.put("name", "A");

        MvcResult result = mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oneCharPayload)))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        assertThat(data).isNotNull();
        String nameMessage = data.get("name").asText();
        assertThat(nameMessage).isNotBlank();
        // AC-0001-12: verificar el texto en español, no solo que haya un mensaje.
        assertThat(nameMessage.toLowerCase()).contains("nombre");
    }

    // AC-0001-03 (hallazgo del reviewer): el modal de edición no manda `email`. Editar un cliente
    // sin ese campo no puede borrar el email que ya tenía en base.
    @Test
    void updateClient_withoutEmailInPayload_keepsPersistedEmail() throws Exception {
        MvcResult createResult = mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validClientPayload("50111222"))))
                .andExpect(status().isOk())
                .andReturn();
        long id = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Mismo payload que arma ClientsPage.handleEditClient: sin email.
        Map<String, Object> editFromModal = validClientPayload("50111222");
        editFromModal.remove("email");
        editFromModal.put("phone", "1199887766");

        mockMvc.perform(put("/api/clients/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(editFromModal)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/clients/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phone").value("1199887766"))
                .andExpect(jsonPath("$.data.email").value("marina.suarez@example.com"));
    }

    // Caso de borde de la spec 0001 (hallazgo del reviewer): un DNI con espacios alrededor que queda
    // en 8 caracteres después del trim se acepta, y se guarda sin los espacios.
    @Test
    void createClient_withDniSurroundedBySpaces_isAcceptedAndStoredTrimmed() throws Exception {
        MvcResult createResult = mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validClientPayload(" 51111222 "))))
                .andExpect(status().isOk())
                .andReturn();
        long id = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        mockMvc.perform(get("/api/clients/{id}", id))
                .andExpect(jsonPath("$.data.dni").value("51111222"));
    }

    // Caso de borde de la spec 0001: un DNI de solo espacios sigue siendo obligatorio.
    @Test
    void createClient_withBlankDni_respondsBadRequest() throws Exception {
        mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validClientPayload("        "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.dni").exists());
    }
}
