package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Exercise;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.entity.enums.ExerciseType;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.ExerciseRepository;
import com.aplicacionGym.gymapp.repository.MonthlyTypeRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.LocalDate;
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
 * Spec 0015 (BUG-26): los catálogos (ejercicios, tipos de plan, productos, profesores y
 * administradores) responden en español cuando el recurso no existe o no se puede borrar.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CatalogNotFoundMessagesTest {

    private static final long ID_INEXISTENTE = 999999L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private MonthlyTypeRepository monthlyTypeRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    private MockHttpServletRequestBuilder comoAdmin(MockHttpServletRequestBuilder builder) {
        return builder.with(user("admin-0015@admins.test").password("x").roles("ADMIN"));
    }

    @ParameterizedTest(name = "AC-0015-01: {0} {1}/999999 responde 404 con \"{2} 999999\"")
    @CsvSource({
            "GET,    /api/exercises,      Ejercicio no encontrado con id:",
            "PUT,    /api/exercises,      Ejercicio no encontrado con id:",
            "DELETE, /api/exercises,      Ejercicio no encontrado con id:",
            "GET,    /api/monthly-type,   Tipo de plan mensual no encontrado con id:",
            "PUT,    /api/monthly-type,   Tipo de plan mensual no encontrado con id:",
            "DELETE, /api/monthly-type,   Tipo de plan mensual no encontrado con id:",
            "GET,    /api/products,       Producto no encontrado con id:",
            "PUT,    /api/products,       Producto no encontrado con id:",
            "DELETE, /api/products,       Producto no encontrado con id:",
            "GET,    /api/professors,     Profesor no encontrado con id:",
            "PUT,    /api/professors,     Profesor no encontrado con id:",
            "DELETE, /api/professors,     Profesor no encontrado con id:",
            "GET,    /api/administrators, Administrador no encontrado con id:",
            "PUT,    /api/administrators, Administrador no encontrado con id:",
            "DELETE, /api/administrators, Administrador no encontrado con id:",
    })
    void ac_0015_01_elRecursoInexistenteRespondeEnEspanolConElId(String verbo, String ruta, String mensaje) throws Exception {
        MockHttpServletRequestBuilder pedido = request(HttpMethod.valueOf(verbo), ruta + "/{id}", ID_INEXISTENTE);
        if ("PUT".equals(verbo)) {
            pedido = pedido.contentType(MediaType.APPLICATION_JSON).content("{}");
        }

        mockMvc.perform(comoAdmin(pedido))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.succes").value(false))
                .andExpect(jsonPath("$.message").value(mensaje + " " + ID_INEXISTENTE));
    }

    @Test
    @DisplayName("AC-0015-02: un ejercicio usado en una rutina no se borra y el mensaje lo explica en español")
    void ac_0015_02_elEjercicioEnUsoNoSeBorraYLoExplicaEnEspanol() throws Exception {
        Exercise exercise = exerciseRepository.save(
                new Exercise(null, "Remo con barra 0015", "Espalda", "desc", ExerciseType.FUERZA_PESAS));

        Map<String, Object> exerciseBody = new LinkedHashMap<>();
        exerciseBody.put("idExercise", exercise.getId());
        exerciseBody.put("sets", 4);
        exerciseBody.put("repetitions", 10);
        Map<String, Object> dayBody = new LinkedHashMap<>();
        dayBody.put("dayOrder", 1);
        dayBody.put("exercises", List.of(exerciseBody));
        Map<String, Object> routineBody = new LinkedHashMap<>();
        routineBody.put("name", "Rutina de Espalda 0015");
        routineBody.put("goal", "Ganar masa muscular");
        routineBody.put("active", true);
        routineBody.put("days", List.of(dayBody));
        mockMvc.perform(comoAdmin(post("/api/routines"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routineBody)))
                .andExpect(status().isOk());

        // El status no se afirma: hoy es 404 y debería ser 409 (BUG-27, fuera de alcance).
        mockMvc.perform(comoAdmin(delete("/api/exercises/{id}", exercise.getId())))
                .andExpect(jsonPath("$.succes").value(false))
                .andExpect(jsonPath("$.message")
                        .value("No se puede eliminar el ejercicio porque está en uso en una o más rutinas."));

        mockMvc.perform(comoAdmin(get("/api/exercises/{id}", exercise.getId())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("AC-0015-02: un tipo de plan con pagos no se borra y el mensaje lo explica en español")
    void ac_0015_02_elTipoDePlanConPagosNoSeBorraYLoExplicaEnEspanol() throws Exception {
        Client client = new Client();
        client.setName("Elena");
        client.setLastName("Sosa");
        client.setDni("61500003");
        client.setPhone("1144556688");
        client.setActive(true);
        client = clientRepository.save(client);

        Professor professor = new Professor();
        professor.setName("Pablo");
        professor.setLastName("Rey");
        professor.setDni("91500003");
        professor.setPhone("1155667711");
        professor.setEmail("91500003@profesores.test");
        professor.setPassword("x");
        professor.setActive(true);
        professor = professorRepository.save(professor);

        MonthlyType plan = monthlyTypeRepository.save(new MonthlyType(null, "Trimestral 0015", 50000, 90));
        paymentRepository.save(
                new Payment(null, client, professor, plan, 50000, LocalDate.of(2026, 9, 1), PaymentType.MONTHLY));

        // El status no se afirma: hoy es 404 y debería ser 409 (BUG-27, fuera de alcance).
        mockMvc.perform(comoAdmin(delete("/api/monthly-type/{id}", plan.getId())))
                .andExpect(jsonPath("$.succes").value(false))
                .andExpect(jsonPath("$.message")
                        .value("No se puede eliminar el tipo de plan porque tiene pagos registrados."));

        mockMvc.perform(comoAdmin(get("/api/monthly-type/{id}", plan.getId())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("AC-0015-02: crear un producto con un administrador inexistente responde 404 en español")
    void ac_0015_02_elProductoConAdministradorInexistenteRespondeEnEspanol() throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("productName", "Shaker 0015");
        body.put("price", 3500);
        body.put("stock", 4);
        body.put("administrator", Map.of("id", ID_INEXISTENTE));

        mockMvc.perform(comoAdmin(post("/api/products"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Administrador no encontrado con id: " + ID_INEXISTENTE));
    }
}
