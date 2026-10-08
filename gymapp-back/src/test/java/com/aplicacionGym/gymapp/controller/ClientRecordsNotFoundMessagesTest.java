package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spec 0015 (BUG-26): los registros de la ficha del alumno (agua, suplementos, nutrición y
 * registros físicos) responden en español cuando el alumno o el registro no existen.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ClientRecordsNotFoundMessagesTest {

    private static final long ID_INEXISTENTE = 999999L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClientRepository clientRepository;

    private MockHttpServletRequestBuilder comoAdmin(MockHttpServletRequestBuilder builder) {
        return builder.with(user("admin-0015@admins.test").password("x").roles("ADMIN"));
    }

    @ParameterizedTest(name = "AC-0015-07: POST {0} con un alumno inexistente responde 404 en español")
    @CsvSource(delimiter = '|', value = {
            "/api/clients/999999/water/add?amountMl=250 | {}",
            "/api/clients/999999/supplements            | {\"creatineTaken\":true,\"proteinTaken\":false}",
            "/api/clients/999999/nutrition/plan         | {\"name\":\"Plan 0015\",\"dailyCalories\":2200}",
            "/api/clients/999999/nutrition/meals        | {\"mealType\":\"ALMUERZO\",\"description\":\"Pollo con arroz\",\"calories\":600}",
            "/api/physical-records/client/999999        | {\"weight\":80.5,\"height\":1.8}",
    })
    void ac_0015_07_elAlumnoInexistenteRespondeEnEspanolConElId(String ruta, String cuerpo) throws Exception {
        mockMvc.perform(comoAdmin(post(ruta))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.succes").value(false))
                .andExpect(jsonPath("$.message").value("Cliente no encontrado con id: " + ID_INEXISTENTE));
    }

    @Test
    @DisplayName("AC-0015-08: borrar un registro físico inexistente responde 404 en español")
    void ac_0015_08_elRegistroFisicoInexistenteRespondeEnEspanol() throws Exception {
        mockMvc.perform(comoAdmin(delete("/api/physical-records/{id}", ID_INEXISTENTE)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Registro físico no encontrado con id: " + ID_INEXISTENTE));
    }

    @Test
    @DisplayName("AC-0015-08: borrar una comida inexistente de un alumno real responde 404 en español")
    void ac_0015_08_laComidaInexistenteRespondeEnEspanol() throws Exception {
        Client client = new Client();
        client.setName("Marta");
        client.setLastName("Ojeda");
        client.setDni("61500006");
        client.setPhone("1144556600");
        client.setActive(true);
        client = clientRepository.save(client);

        mockMvc.perform(comoAdmin(delete("/api/clients/{clientId}/nutrition/meals/{mealId}", client.getId(), ID_INEXISTENTE)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Comida no encontrada con id: " + ID_INEXISTENTE));
    }
}
