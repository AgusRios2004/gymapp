package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Exercise;
import com.aplicacionGym.gymapp.entity.enums.ExerciseType;
import com.aplicacionGym.gymapp.repository.AdministratorRepository;
import com.aplicacionGym.gymapp.repository.ExerciseRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.MockMvc;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * El frontend (CreateRoutineModal/EditRoutineModal/RoutineDetailsModal) pide y muestra un peso por
 * ejercicio, pero RoutineExercise no lo persistía: se perdía silenciosamente al guardar. Cubre que
 * el peso sobrevive un create, un update y se devuelve en el GET.
 */
@SpringBootTest
@AutoConfigureMockMvc
class RoutineExerciseWeightTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

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

    private Exercise saveExercise(String name) {
        return exerciseRepository.save(new Exercise(null, name, "Piernas", "desc", ExerciseType.FUERZA_PESAS));
    }

    private Map<String, Object> routineBody(Long exerciseId, double weight) {
        Map<String, Object> exerciseBody = new LinkedHashMap<>();
        exerciseBody.put("idExercise", exerciseId);
        exerciseBody.put("sets", 4);
        exerciseBody.put("repetitions", 10);
        exerciseBody.put("weight", weight);

        Map<String, Object> dayBody = new LinkedHashMap<>();
        dayBody.put("dayOrder", 1);
        dayBody.put("exercises", List.of(exerciseBody));

        Map<String, Object> routineBody = new LinkedHashMap<>();
        routineBody.put("name", "Rutina de Fuerza");
        routineBody.put("goal", "Ganar masa muscular");
        routineBody.put("active", true);
        routineBody.put("days", List.of(dayBody));
        return routineBody;
    }

    @Test
    void createRoutine_withWeightPerExercise_persistsAndReturnsIt() throws Exception {
        Administrator admin = saveAdministrator("70500001");
        Exercise exercise = saveExercise("Sentadilla Libre");

        MvcResult result = mockMvc.perform(post("/api/routines")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routineBody(exercise.getId(), 82.5))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.days[0].exercises[0].weight").value(82.5))
                .andReturn();

        JsonNode created = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        long routineId = created.get("id").asLong();

        mockMvc.perform(get("/api/routines/{id}", routineId)
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.days[0].exercises[0].weight").value(82.5));
    }

    @Test
    void updateRoutine_changingWeight_persistsNewValue() throws Exception {
        Administrator admin = saveAdministrator("70500002");
        Exercise exercise = saveExercise("Press de Banca Plano");

        MvcResult created = mockMvc.perform(post("/api/routines")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routineBody(exercise.getId(), 40.0))))
                .andExpect(status().isOk())
                .andReturn();

        long routineId = objectMapper.readTree(created.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        mockMvc.perform(put("/api/routines/{id}", routineId)
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routineBody(exercise.getId(), 45.0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.days[0].exercises[0].weight").value(45.0));

        mockMvc.perform(get("/api/routines/{id}", routineId)
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.days[0].exercises[0].weight").value(45.0));
    }
}
