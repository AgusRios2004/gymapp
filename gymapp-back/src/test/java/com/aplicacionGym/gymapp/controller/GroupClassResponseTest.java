package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.entity.Routine;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
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

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spec 0011: /api/classes responde con un DTO. La entidad traía el profesor completo (con el hash
 * de la contraseña) y, si la rutina de la clase era la activa de un alumno, un ciclo
 * Routine → clients → routineActive → clients… que dejaba un JSON inválido con status 200.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class GroupClassResponseTest {

    private static final List<String> PROFESSOR_PRIVATE_FIELDS = List.of("password", "email", "dni", "phone");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private RoutineRepository routineRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private GroupClassRepository groupClassRepository;

    private Professor saveProfessor(String dni) {
        Professor professor = new Professor();
        professor.setName("Hugo");
        professor.setLastName("Ibarra");
        professor.setDni(dni);
        professor.setPhone("1188990011");
        professor.setEmail(dni + "@profesores.test");
        professor.setPassword("hash-que-no-tiene-que-salir");
        professor.setActive(true);
        return professorRepository.save(professor);
    }

    // El ciclo real: la rutina es la activa de un alumno y está en su lista de rutinas.
    private Routine saveRoutineActiveForAClient(String name, String clientDni) {
        Routine routine = new Routine();
        routine.setName(name);
        routine.setGoal("Fuerza");
        routine.setActive(true);
        routine = routineRepository.save(routine);

        Client client = new Client();
        client.setName("Qa");
        client.setLastName("Uno");
        client.setDni(clientDni);
        client.setPhone("1122334455");
        client.setEmail(clientDni + "@clientes.test");
        client.setPassword("x");
        client.setActive(true);
        client.setRoutineActive(routine);
        client.setRoutines(List.of(routine));
        clientRepository.save(client);
        return routine;
    }

    private GroupClass saveGroupClass(String name, Professor professor, Routine routine) {
        GroupClass groupClass = new GroupClass();
        groupClass.setClassName(name);
        groupClass.setProfessor(professor);
        groupClass.setRoutine(routine);
        groupClass.setDaysOfWeek(List.of("MONDAY", "THURSDAY"));
        groupClass.setStartTime("18:00");
        groupClass.setEndTime("19:00");
        groupClass.setCapacity(15);
        return groupClassRepository.save(groupClass);
    }

    private Map<String, Object> classPayload(Professor professor, Routine routine) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("className", "Calistenia");
        payload.put("professor", Map.of("id", professor.getId()));
        payload.put("routine", Map.of("id", routine.getId()));
        payload.put("daysOfWeek", List.of("TUESDAY"));
        payload.put("startTime", "08:00");
        payload.put("endTime", "09:00");
        payload.put("capacity", 12);
        return payload;
    }

    // Parsear con ObjectMapper es la prueba de JSON válido: el ciclo dejaba el cuerpo truncado.
    private JsonNode performAndParse(MockHttpServletRequestBuilder request) throws Exception {
        String body = mockMvc.perform(request)
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("data");
    }

    private JsonNode classById(JsonNode classes, long id) {
        for (JsonNode groupClass : classes) {
            if (groupClass.get("id").asLong() == id) {
                return groupClass;
            }
        }
        throw new AssertionError("La clase " + id + " no está en la respuesta");
    }

    private void assertProfessorSummary(JsonNode professorNode, Professor professor) {
        assertThat(professorNode.get("id").asLong()).isEqualTo(professor.getId());
        assertThat(professorNode.get("name").asText()).isEqualTo("Hugo");
        assertThat(professorNode.get("lastName").asText()).isEqualTo("Ibarra");
        for (String field : PROFESSOR_PRIVATE_FIELDS) {
            assertThat(professorNode.has(field)).as("professor." + field).isFalse();
        }
    }

    // createClass y updateClass guardan la referencia que llega en el body (solo id), así que en la
    // respuesta del POST/PUT name y lastName salen null; el frontend vuelve a pedir la lista después
    // de guardar. Se verifica la forma del resumen, no los valores (spec 0011, fuera de alcance tocar
    // GroupClassService).
    private void assertProfessorSummaryShape(JsonNode professorNode, Professor professor) {
        assertThat(professorNode.get("id").asLong()).isEqualTo(professor.getId());
        assertThat(professorNode.has("name")).as("professor.name").isTrue();
        assertThat(professorNode.has("lastName")).as("professor.lastName").isTrue();
        for (String field : PROFESSOR_PRIVATE_FIELDS) {
            assertThat(professorNode.has(field)).as("professor." + field).isFalse();
        }
    }

    private void assertRoutineSummary(JsonNode routineNode) {
        assertThat(routineNode.has("clients")).as("routine.clients").isFalse();
        assertThat(routineNode.has("days")).as("routine.days").isFalse();
    }

    @Test
    @DisplayName("AC-0011-01: con la rutina activa de un alumno, GET /api/classes responde JSON válido con la rutina")
    void ac_0011_01_conLaRutinaActivaDeUnAlumnoGetClassesRespondeJsonValidoConLaRutina() throws Exception {
        Professor professor = saveProfessor("95110001");
        Routine routine = saveRoutineActiveForAClient("Rutina Calistenia", "61100001");
        GroupClass groupClass = saveGroupClass("Calistenia", professor, routine);

        JsonNode found = classById(performAndParse(get("/api/classes")), groupClass.getId());

        assertThat(found.get("routine").get("id").asLong()).isEqualTo(routine.getId());
        assertThat(found.get("routine").get("name").asText()).isEqualTo("Rutina Calistenia");
    }

    @Test
    @DisplayName("AC-0011-02: el profesor de cada clase trae id, nombre y apellido, sin contraseña ni datos de contacto")
    void ac_0011_02_elProfesorTraeIdNombreYApellidoSinContrasenaNiContacto() throws Exception {
        Professor professor = saveProfessor("95110002");
        GroupClass groupClass = saveGroupClass("Funcional", professor, null);

        JsonNode classes = performAndParse(get("/api/classes"));

        assertProfessorSummary(classById(classes, groupClass.getId()).get("professor"), professor);
        for (JsonNode each : classes) {
            for (String field : PROFESSOR_PRIVATE_FIELDS) {
                assertThat(each.path("professor").has(field)).as("professor." + field).isFalse();
            }
        }
    }

    @Test
    @DisplayName("AC-0011-03: la rutina de una clase no trae clients ni days")
    void ac_0011_03_laRutinaDeUnaClaseNoTraeClientsNiDays() throws Exception {
        Professor professor = saveProfessor("95110003");
        Routine routine = saveRoutineActiveForAClient("Rutina Fuerza", "61100003");
        GroupClass groupClass = saveGroupClass("Fuerza", professor, routine);

        JsonNode found = classById(performAndParse(get("/api/classes")), groupClass.getId());

        assertRoutineSummary(found.get("routine"));
    }

    @Test
    @DisplayName("AC-0011-04: clase sin rutina y sin profesor responde null en los dos y el resto con los valores guardados")
    void ac_0011_04_claseSinRutinaYSinProfesorRespondeNullYElRestoConLosValores() throws Exception {
        GroupClass groupClass = saveGroupClass("Yoga", null, null);

        JsonNode found = classById(performAndParse(get("/api/classes")), groupClass.getId());

        assertThat(found.get("routine").isNull()).as("routine").isTrue();
        assertThat(found.get("professor").isNull()).as("professor").isTrue();
        assertThat(found.get("className").asText()).isEqualTo("Yoga");
        assertThat(found.get("daysOfWeek")).extracting(JsonNode::asText).containsExactly("MONDAY", "THURSDAY");
        assertThat(found.get("startTime").asText()).isEqualTo("18:00");
        assertThat(found.get("endTime").asText()).isEqualTo("19:00");
        assertThat(found.get("capacity").asInt()).isEqualTo(15);
    }

    @Test
    @DisplayName("AC-0011-05: POST y PUT con la rutina activa de un alumno responden JSON válido sin datos privados")
    void ac_0011_05_postYPutConLaRutinaActivaRespondenJsonValidoSinDatosPrivados() throws Exception {
        Professor professor = saveProfessor("95110005");
        Routine routine = saveRoutineActiveForAClient("Rutina Mixta", "61100005");
        String payload = objectMapper.writeValueAsString(classPayload(professor, routine));

        JsonNode created = performAndParse(post("/api/classes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload));
        assertProfessorSummaryShape(created.get("professor"), professor);
        assertRoutineSummary(created.get("routine"));

        JsonNode updated = performAndParse(put("/api/classes/{id}", created.get("id").asLong())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload));
        assertProfessorSummaryShape(updated.get("professor"), professor);
        assertRoutineSummary(updated.get("routine"));
    }
}
