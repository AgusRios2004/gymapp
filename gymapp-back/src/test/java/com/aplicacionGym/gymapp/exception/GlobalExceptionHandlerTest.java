package com.aplicacionGym.gymapp.exception;

import com.aplicacionGym.gymapp.service.ClientService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests rojos de la spec 0001: formato uniforme de error (WebApiResponse) y
 * mapeo por tipo de excepción de GlobalExceptionHandler.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ClientService clientService;

    // AC-0001-05: un POST con JSON mal formado responde 400 en español, sin texto del parser de Jackson.
    @Test
    void malformedJsonBody_respondsBadRequestInSpanishWithoutJacksonDetails() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"name\": \"Ana\", "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(body);
        JsonNode messageNode = json.get("message");
        assertThat(messageNode).isNotNull();
        String message = messageNode.asText();
        assertThat(message).isNotBlank();
        assertThat(message.toLowerCase()).doesNotContain("json parse error");
        assertThat(body).doesNotContain("com.fasterxml");
        assertThat(message.toLowerCase()).doesNotContain("jackson");
    }

    // AC-0001-06: GET con id inexistente responde 404 con succes:false y message en español que incluye el id.
    @Test
    void getClientById_withUnknownId_respondsNotFoundWithSpanishMessageIncludingId() throws Exception {
        long missingId = 987654L;
        when(clientService.getClientById(missingId)).thenReturn(Optional.empty());

        MvcResult result = mockMvc.perform(get("/api/clients/{id}", missingId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String message = json.get("message").asText();
        assertThat(message).isNotBlank();
        assertThat(message).contains(String.valueOf(missingId));
        assertThat(message.toLowerCase()).doesNotContain("not found");
        assertThat(message.toLowerCase()).containsAnyOf("no encontrado", "no encontrada", "no existe");
    }

    // AC-0001-11: una excepción no mapeada lanzada desde un service responde 500 con el mensaje fijo
    // "Error inesperado, intentá de nuevo." y sin filtrar el mensaje original de la excepción.
    @Test
    void unmappedServiceException_respondsGenericSpanish500WithoutLeakingInternalMessage() throws Exception {
        long id = 42L;
        String internalMessage = "Fallo interno de conexión a la base de datos";
        when(clientService.getClientById(id)).thenThrow(new RuntimeException(internalMessage));

        MvcResult result = mockMvc.perform(get("/api/clients/{id}", id))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(body);
        assertThat(json.get("message").asText()).isEqualTo("Error inesperado, intentá de nuevo.");
        assertThat(body).doesNotContain(internalMessage);
    }

    // Comportamiento esperado 3 y 4 de la spec 0001 (hallazgo del reviewer): los errores de cliente que
    // resuelve Spring MVC no pueden terminar en el 500 genérico del handler de Exception.
    @Test
    void nonNumericPathVariable_respondsBadRequestInSpanish() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/clients/{id}", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        String message = objectMapper.readTree(result.getResponse().getContentAsString()).get("message").asText();
        assertThat(message).isNotBlank().isNotEqualTo("Error inesperado, intentá de nuevo.");
    }

    @Test
    void unknownRoute_respondsNotFound() throws Exception {
        mockMvc.perform(get("/api/esta-ruta-no-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.succes").value(false));
    }

    @Test
    void unsupportedHttpMethod_respondsMethodNotAllowed() throws Exception {
        mockMvc.perform(put("/api/payments/monthly")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.succes").value(false));
    }

    // AC-0001-12: una excepción con message null igual responde con un message no vacío.
    @Test
    void exceptionWithNullMessage_stillRespondsWithNonEmptyMessage() throws Exception {
        long id = 321L;
        when(clientService.getClientById(id)).thenThrow(new ResourceNotFoundException(null));

        MvcResult result = mockMvc.perform(get("/api/clients/{id}", id)).andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode messageNode = json.get("message");
        assertThat(messageNode).isNotNull();
        assertThat(messageNode.isNull()).isFalse();
        assertThat(messageNode.asText()).isNotBlank();
    }
}
