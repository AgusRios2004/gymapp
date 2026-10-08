package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Exercise;
import com.aplicacionGym.gymapp.entity.Routine;
import com.aplicacionGym.gymapp.entity.enums.ExerciseType;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.ExerciseRepository;
import com.aplicacionGym.gymapp.repository.RoutineRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spec 0015 (BUG-26): los errores de rutinas (inexistente, asignación, ejercicio inexistente, día
 * repetido y borrado de una rutina asignada) responden en español.
 */
@SpringBootTest
@AutoConfigureMockMvc
class RoutineErrorMessagesTest {

    private static final long ID_INEXISTENTE = 999999L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private RoutineRepository routineRepository;

    private MockHttpServletRequestBuilder comoAdmin(MockHttpServletRequestBuilder builder) {
        return builder.with(user("admin-0015@admins.test").password("x").roles("ADMIN"));
    }

    private Client saveClient(String dni) {
        Client client = new Client();
        client.setName("Ramiro");
        client.setLastName("Ledesma");
        client.setDni(dni);
        client.setPhone("1144556699");
        client.setActive(true);
        return clientRepository.save(client);
    }

    private Exercise saveExercise(String name) {
        return exerciseRepository.save(new Exercise(null, name, "Piernas", "desc", ExerciseType.FUERZA_PESAS));
    }

    private Map<String, Object> dayBody(int dayOrder, Long exerciseId) {
        Map<String, Object> exerciseBody = new LinkedHashMap<>();
        exerciseBody.put("idExercise", exerciseId);
        exerciseBody.put("sets", 4);
        exerciseBody.put("repetitions", 10);

        Map<String, Object> dayBody = new LinkedHashMap<>();
        dayBody.put("dayOrder", dayOrder);
        dayBody.put("exercises", List.of(exerciseBody));
        return dayBody;
    }

    private Map<String, Object> routineBody(String name, List<Map<String, Object>> days) {
        Map<String, Object> routineBody = new LinkedHashMap<>();
        routineBody.put("name", name);
        routineBody.put("goal", "Ganar masa muscular");
        routineBody.put("active", true);
        routineBody.put("days", days);
        return routineBody;
    }

    private long createRoutine(String name, Long exerciseId) throws Exception {
        MvcResult created = mockMvc.perform(comoAdmin(post("/api/routines"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routineBody(name, List.of(dayBody(1, exerciseId))))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(created.getResponse().getContentAsString()).get("data").get("id").asLong();
    }

    @ParameterizedTest(name = "AC-0015-03: {0} /api/routines/999999 responde 404 en español con el id")
    @ValueSource(strings = { "GET", "PUT", "DELETE" })
    void ac_0015_03_laRutinaInexistenteRespondeEnEspanolConElId(String verbo) throws Exception {
        MockHttpServletRequestBuilder pedido = request(HttpMethod.valueOf(verbo), "/api/routines/{id}", ID_INEXISTENTE);
        if ("PUT".equals(verbo)) {
            pedido = pedido.contentType(MediaType.APPLICATION_JSON).content("{}");
        }

        mockMvc.perform(comoAdmin(pedido))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.succes").value(false))
                .andExpect(jsonPath("$.message").value("Rutina no encontrada con id: " + ID_INEXISTENTE));
    }

    @Test
    @DisplayName("AC-0015-04: asignar una rutina a un alumno inexistente responde 404 en español")
    void ac_0015_04_asignarAUnAlumnoInexistenteRespondeEnEspanol() throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("clientId", ID_INEXISTENTE);
        body.put("routineTemplateId", ID_INEXISTENTE);

        mockMvc.perform(comoAdmin(post("/api/routines/assign"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Cliente no encontrado con id: " + ID_INEXISTENTE));
    }

    @Test
    @DisplayName("AC-0015-04: asignar una plantilla inexistente a un alumno real responde 404 en español")
    void ac_0015_04_asignarUnaPlantillaInexistenteRespondeEnEspanol() throws Exception {
        Client client = saveClient("61500004");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("clientId", client.getId());
        body.put("routineTemplateId", ID_INEXISTENTE);

        mockMvc.perform(comoAdmin(post("/api/routines/assign"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Rutina no encontrada con id: " + ID_INEXISTENTE));
    }

    @Test
    @DisplayName("AC-0015-05: crear una rutina con un ejercicio inexistente responde 404 en español")
    void ac_0015_05_laRutinaConUnEjercicioInexistenteRespondeEnEspanol() throws Exception {
        Map<String, Object> body = routineBody("Rutina con ejercicio fantasma 0015", List.of(dayBody(1, ID_INEXISTENTE)));

        mockMvc.perform(comoAdmin(post("/api/routines"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ejercicio no encontrado con id: " + ID_INEXISTENTE));
    }

    @Test
    @DisplayName("AC-0015-05: crear una rutina con un día repetido responde 400 en español")
    void ac_0015_05_laRutinaConUnDiaRepetidoRespondeEnEspanol() throws Exception {
        Exercise exercise = saveExercise("Estocadas 0015");
        Map<String, Object> body = routineBody("Rutina con día repetido 0015",
                List.of(dayBody(2, exercise.getId()), dayBody(2, exercise.getId())));

        mockMvc.perform(comoAdmin(post("/api/routines"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La rutina tiene el día 2 repetido."));
    }

    @Test
    @DisplayName("AC-0015-06: una rutina asignada a un alumno no se borra y el mensaje lo explica en español")
    void ac_0015_06_laRutinaAsignadaNoSeBorraYLoExplicaEnEspanol() throws Exception {
        long routineId = createRoutine("Rutina asignada 0015", saveExercise("Peso muerto 0015").getId());
        Routine routine = routineRepository.findById(routineId).orElseThrow();

        Client client = saveClient("61500005");
        client.setRoutineActive(routine);
        client.setRoutines(new ArrayList<>(List.of(routine)));
        clientRepository.save(client);

        // El status no se afirma: hoy es 404 y debería ser 409 (BUG-27, fuera de alcance).
        mockMvc.perform(comoAdmin(delete("/api/routines/{id}", routineId)))
                .andExpect(jsonPath("$.succes").value(false))
                .andExpect(jsonPath("$.message")
                        .value("No se puede eliminar la rutina porque está asignada a uno o más alumnos."));

        mockMvc.perform(comoAdmin(get("/api/routines/{id}", routineId)))
                .andExpect(status().isOk());
    }
}
