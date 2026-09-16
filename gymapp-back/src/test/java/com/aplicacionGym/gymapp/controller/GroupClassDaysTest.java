package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Professor;
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

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests rojos de la spec 0003: clases grupales con varios días (daysOfWeek) en vez de un único
 * dayOfWeek. Hoy GroupClass no tiene daysOfWeek (la respuesta de GET no trae ese campo) y ni
 * createClass ni updateClass validan ni normalizan días, así que estos tests quedan en rojo hasta
 * T1.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class GroupClassDaysTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProfessorRepository professorRepository;

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

    private Map<String, Object> classPayload(List<String> daysOfWeek, Long professorId) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("className", "Funcional");
        payload.put("professor", Map.of("id", professorId));
        payload.put("startTime", "10:00");
        payload.put("endTime", "11:00");
        payload.put("capacity", 20);
        if (daysOfWeek != null) {
            payload.put("daysOfWeek", daysOfWeek);
        }
        return payload;
    }

    private long createClassAndGetId(Map<String, Object> payload) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/classes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("id").asLong();
    }

    private List<JsonNode> getAllClasses() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/classes"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode classes = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        List<JsonNode> list = new ArrayList<>();
        classes.forEach(list::add);
        return list;
    }

    private JsonNode getClassById(long id) throws Exception {
        return getAllClasses().stream()
                .filter(node -> node.get("id").asLong() == id)
                .findFirst()
                .orElseThrow(() -> new AssertionError("Clase " + id + " no encontrada en GET /api/classes"));
    }

    private List<String> toStringList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        assertThat(arrayNode).as("daysOfWeek en la respuesta").isNotNull();
        arrayNode.forEach(node -> list.add(node.asText()));
        return list;
    }

    // AC-0003-01: POST con daysOfWeek: ["MONDAY","WEDNESDAY","FRIDAY"] responde 200, y GET /api/classes
    // devuelve esa clase con exactamente esos tres días, en ese orden.
    @Test
    void createClass_withThreeDays_respondsOkAndGetReturnsSameThreeDaysInOrder() throws Exception {
        Long professorId = saveProfessor("91403001").getId();

        long id = createClassAndGetId(classPayload(List.of("MONDAY", "WEDNESDAY", "FRIDAY"), professorId));

        JsonNode created = getClassById(id);
        assertThat(toStringList(created.get("daysOfWeek"))).containsExactly("MONDAY", "WEDNESDAY", "FRIDAY");
    }

    // AC-0003-02: POST sin daysOfWeek o con daysOfWeek: [] responde 400 con message en español y no
    // crea la clase.
    @Test
    void createClass_withMissingOrEmptyDaysOfWeek_respondsBadRequestAndDoesNotCreateClass() throws Exception {
        Long professorId = saveProfessor("91403002").getId();
        int countBefore = getAllClasses().size();

        Map<String, Object> withoutDaysOfWeek = classPayload(null, professorId);
        MvcResult missingResult = mockMvc.perform(post("/api/classes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(withoutDaysOfWeek)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();
        String missingMessage = objectMapper.readTree(missingResult.getResponse().getContentAsString())
                .get("message").asText();
        assertThat(missingMessage).isNotBlank();

        mockMvc.perform(post("/api/classes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(classPayload(List.of(), professorId))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.succes").value(false));

        assertThat(getAllClasses().size()).isEqualTo(countBefore);
    }

    // AC-0003-03: POST con daysOfWeek: ["MONDAY","LUNES"] responde 400 y message menciona LUNES.
    @Test
    void createClass_withInvalidDay_respondsBadRequestMentioningRejectedValue() throws Exception {
        Long professorId = saveProfessor("91403003").getId();

        MvcResult result = mockMvc.perform(post("/api/classes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(classPayload(List.of("MONDAY", "LUNES"), professorId))))
                .andExpect(status().isBadRequest())
                .andReturn();

        String message = objectMapper.readTree(result.getResponse().getContentAsString()).get("message").asText();
        assertThat(message).contains("LUNES");
    }

    // AC-0003-04: POST con daysOfWeek: ["FRIDAY","MONDAY","MONDAY"] responde 200 y la clase queda con
    // ["MONDAY","FRIDAY"] (sin repetidos, en orden de semana).
    @Test
    void createClass_withRepeatedDays_dedupesAndOrdersByWeekday() throws Exception {
        Long professorId = saveProfessor("91403004").getId();

        long id = createClassAndGetId(classPayload(List.of("FRIDAY", "MONDAY", "MONDAY"), professorId));

        JsonNode created = getClassById(id);
        assertThat(toStringList(created.get("daysOfWeek"))).containsExactly("MONDAY", "FRIDAY");
    }

    // AC-0003-05: PUT sobre una clase con ["MONDAY","WEDNESDAY"] enviando ["TUESDAY"] deja la clase
    // solo con ["TUESDAY"] (reemplaza, no suma).
    @Test
    void updateClass_withNewDays_replacesDaysInsteadOfAddingThem() throws Exception {
        Long professorId = saveProfessor("91403005").getId();
        long id = createClassAndGetId(classPayload(List.of("MONDAY", "WEDNESDAY"), professorId));

        mockMvc.perform(put("/api/classes/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(classPayload(List.of("TUESDAY"), professorId))))
                .andExpect(status().isOk());

        JsonNode updated = getClassById(id);
        assertThat(toStringList(updated.get("daysOfWeek"))).containsExactly("TUESDAY");
    }

    // AC-0003-06: PUT con un id inexistente responde 404 con message en español que incluye el id
    // (hoy updateClass tira RuntimeException → 500).
    @Test
    void updateClass_withNonExistentId_respondsNotFoundMentioningId() throws Exception {
        Long professorId = saveProfessor("91403006").getId();
        long nonExistentId = 987_654_321L;

        MvcResult result = mockMvc.perform(put("/api/classes/{id}", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(classPayload(List.of("MONDAY"), professorId))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        String message = objectMapper.readTree(result.getResponse().getContentAsString()).get("message").asText();
        assertThat(message).contains(String.valueOf(nonExistentId));
    }
}
