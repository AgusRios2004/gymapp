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

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spec 0014: plan y comidas responden con un DTO. Las entidades NutritionPlan y MealLog traían el
 * Client completo y, con rutina activa, el ciclo routineActive → clients → routineActive…
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class NutritionResponseTest {

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

    private MockHttpServletRequestBuilder postJson(String url, Long clientId, Map<String, Object> body) throws Exception {
        return post(url, clientId).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body));
    }

    private Map<String, Object> planBody() {
        return Map.of("name", "Recomposición", "dailyCalories", 2200, "proteinGrams", 150,
                "carbsGrams", 220, "fatGrams", 70, "guidelines", "Comer cada 4 horas", "active", true);
    }

    private Map<String, Object> mealBody() {
        return Map.of("mealType", "ALMUERZO", "description", "Pollo con arroz", "calories", 650,
                "proteinGrams", 45, "healthySnackReplaced", false);
    }

    private void assertNoClientData(JsonNode node) {
        for (String field : CLIENT_PRIVATE_FIELDS) {
            assertThat(node.findValue(field)).as(field).isNull();
        }
    }

    @Test
    @DisplayName("AC-0014-03: con rutina activa, plan y comidas responden JSON válido con el clientId")
    void ac_0014_03_conRutinaActivaPlanYComidasRespondenJsonValidoConElClientId() throws Exception {
        Client client = saveClientWithActiveRoutine("61410003");

        JsonNode createdPlan = performAndParse(postJson("/api/clients/{id}/nutrition/plan", client.getId(), planBody()));
        JsonNode activePlan = performAndParse(get("/api/clients/{id}/nutrition/plan", client.getId()));
        for (JsonNode plan : List.of(createdPlan, activePlan)) {
            assertThat(plan.get("clientId").asLong()).isEqualTo(client.getId());
            assertThat(plan.get("name").asText()).isEqualTo("Recomposición");
            assertThat(plan.get("dailyCalories").asInt()).isEqualTo(2200);
            assertThat(plan.get("active").asBoolean()).isTrue();
        }

        JsonNode meal = performAndParse(postJson("/api/clients/{id}/nutrition/meals", client.getId(), mealBody()));
        assertThat(meal.get("clientId").asLong()).isEqualTo(client.getId());
        assertThat(meal.get("mealType").asText()).isEqualTo("ALMUERZO");

        JsonNode meals = performAndParse(get("/api/clients/{id}/nutrition/meals", client.getId()));
        assertThat(meals.isArray()).isTrue();
        assertThat(meals).hasSize(1);
        for (JsonNode each : meals) {
            assertThat(each.get("clientId").asLong()).isEqualTo(client.getId());
            assertThat(each.get("description").asText()).isEqualTo("Pollo con arroz");
            assertThat(each.get("healthySnackReplaced").asBoolean()).isFalse();
        }
    }

    @Test
    @DisplayName("AC-0014-04: las respuestas de plan y comidas no traen datos del alumno")
    void ac_0014_04_lasRespuestasDePlanYComidasNoTraenDatosDelAlumno() throws Exception {
        Client client = saveClientWithActiveRoutine("61410004");

        assertNoClientData(performAndParse(postJson("/api/clients/{id}/nutrition/plan", client.getId(), planBody())));
        assertNoClientData(performAndParse(get("/api/clients/{id}/nutrition/plan", client.getId())));
        assertNoClientData(performAndParse(postJson("/api/clients/{id}/nutrition/meals", client.getId(), mealBody())));
        assertNoClientData(performAndParse(get("/api/clients/{id}/nutrition/meals", client.getId())));
    }

    @Test
    @DisplayName("AC-0014-06: sin plan activo, GET /nutrition/plan responde 404")
    void ac_0014_06_sinPlanActivoGetPlanResponde404() throws Exception {
        Client client = saveClientWithActiveRoutine("61410006");

        mockMvc.perform(get("/api/clients/{id}/nutrition/plan", client.getId()))
                .andExpect(status().isNotFound());
    }
}
