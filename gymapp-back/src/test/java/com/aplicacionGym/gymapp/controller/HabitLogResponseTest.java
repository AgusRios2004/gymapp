package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Routine;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.RoutineRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spec 0014: agua y suplementos responden con un DTO. La entidad traía el Client completo (con
 * contraseña, DNI y contacto) y, si el alumno tenía rutina activa, el ciclo
 * routineActive → clients → routineActive… dejaba un JSON inválido con status 200 (BUG-25).
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class HabitLogResponseTest {

    private static final List<String> CLIENT_PRIVATE_FIELDS =
            List.of("client", "password", "dni", "email", "phone", "routineActive");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoutineRepository routineRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private Clock clock;

    // El ciclo real: la rutina es la activa del alumno y está en su lista de rutinas.
    private Client saveClientWithActiveRoutine(String dni) {
        Routine routine = new Routine();
        routine.setName("Rutina " + dni);
        routine.setGoal("Fuerza");
        routine.setActive(true);
        routine = routineRepository.save(routine);

        Client client = new Client();
        client.setName("Carlos");
        client.setLastName("Perez");
        client.setDni(dni);
        client.setPhone("1122334455");
        client.setEmail(dni + "@clientes.test");
        client.setPassword("hash-que-no-tiene-que-salir");
        client.setActive(true);
        client.setRoutineActive(routine);
        client.setRoutines(List.of(routine));
        return clientRepository.save(client);
    }

    // Parsear con ObjectMapper es la prueba de JSON válido: el ciclo dejaba el cuerpo truncado.
    private JsonNode performAndParse(MockHttpServletRequestBuilder request) throws Exception {
        String body = mockMvc.perform(request)
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body);
    }

    private void assertNoClientData(JsonNode node) {
        for (String field : CLIENT_PRIVATE_FIELDS) {
            assertThat(node.findValue(field)).as(field).isNull();
        }
    }

    @Test
    @DisplayName("AC-0014-01: con rutina activa, sumar agua y leerla responde JSON válido con los ml y el clientId")
    void ac_0014_01_conRutinaActivaSumarAguaYLeerlaRespondeJsonValido() throws Exception {
        Client client = saveClientWithActiveRoutine("61400001");

        JsonNode added = performAndParse(post("/api/clients/{id}/water/add", client.getId()).param("amountMl", "250"));
        JsonNode read = performAndParse(get("/api/clients/{id}/water", client.getId()));

        for (JsonNode log : List.of(added, read)) {
            assertThat(log.get("milliliters").asInt()).isEqualTo(250);
            assertThat(log.get("clientId").asLong()).isEqualTo(client.getId());
        }
    }

    @Test
    @DisplayName("AC-0014-02: con rutina activa, guardar y leer suplementos responde JSON válido con lo enviado y el clientId")
    void ac_0014_02_conRutinaActivaGuardarYLeerSuplementosRespondeJsonValido() throws Exception {
        Client client = saveClientWithActiveRoutine("61400002");
        String body = objectMapper.writeValueAsString(Map.of("creatineTaken", true, "proteinTaken", false));

        JsonNode saved = performAndParse(post("/api/clients/{id}/supplements", client.getId())
                .contentType(MediaType.APPLICATION_JSON).content(body));
        JsonNode read = performAndParse(get("/api/clients/{id}/supplements", client.getId()));

        for (JsonNode log : List.of(saved, read)) {
            assertThat(log.get("creatineTaken").asBoolean()).isTrue();
            assertThat(log.get("proteinTaken").asBoolean()).isFalse();
            assertThat(log.get("clientId").asLong()).isEqualTo(client.getId());
        }
    }

    @Test
    @DisplayName("AC-0014-04: las respuestas de agua y suplementos no traen datos del alumno")
    void ac_0014_04_lasRespuestasDeAguaYSuplementosNoTraenDatosDelAlumno() throws Exception {
        Client client = saveClientWithActiveRoutine("61400004");
        String body = objectMapper.writeValueAsString(Map.of("creatineTaken", true, "proteinTaken", true));

        assertNoClientData(performAndParse(post("/api/clients/{id}/water/add", client.getId()).param("amountMl", "500")));
        assertNoClientData(performAndParse(get("/api/clients/{id}/water", client.getId())));
        assertNoClientData(performAndParse(post("/api/clients/{id}/supplements", client.getId())
                .contentType(MediaType.APPLICATION_JSON).content(body)));
        assertNoClientData(performAndParse(get("/api/clients/{id}/supplements", client.getId())));
    }

    @Test
    @DisplayName("AC-0014-05: sin registro del día, agua y suplementos devuelven el registro vacío de hoy con el clientId")
    void ac_0014_05_sinRegistroDelDiaDevuelvenElRegistroVacioDeHoy() throws Exception {
        Client client = saveClientWithActiveRoutine("61400005");
        String today = LocalDate.now(clock).toString();

        JsonNode water = performAndParse(get("/api/clients/{id}/water", client.getId()));
        assertThat(water.get("id").isNull()).isTrue();
        assertThat(water.get("clientId").asLong()).isEqualTo(client.getId());
        assertThat(water.get("date").asText()).isEqualTo(today);
        assertThat(water.get("milliliters").asInt()).isZero();
        assertThat(water.get("targetMilliliters").asInt()).isEqualTo(3000);

        JsonNode supplements = performAndParse(get("/api/clients/{id}/supplements", client.getId()));
        assertThat(supplements.get("id").isNull()).isTrue();
        assertThat(supplements.get("clientId").asLong()).isEqualTo(client.getId());
        assertThat(supplements.get("date").asText()).isEqualTo(today);
        assertThat(supplements.get("creatineTaken").asBoolean()).isFalse();
        assertThat(supplements.get("proteinTaken").asBoolean()).isFalse();
    }
}
