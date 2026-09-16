package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.repository.AdministratorRepository;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests rojos de la spec 0004: PATCH /api/clients/{id}/status activa y desactiva clientes.
 * Cubre AC-0004-01, 02, 03, 04, 05, 12.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ClientStatusTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private GroupClassRepository groupClassRepository;

    private Client saveClient(String dni, boolean active) {
        Client client = new Client();
        client.setName("Marina");
        client.setLastName("Suarez");
        client.setDni(dni);
        client.setPhone("1122334455");
        client.setEmail(dni + "@clientes.test");
        client.setPassword("x");
        client.setActive(active);
        return clientRepository.save(client);
    }

    private Professor saveProfessor(String dni) {
        Professor professor = new Professor();
        professor.setName("Diego");
        professor.setLastName("Molina");
        professor.setDni(dni);
        professor.setPhone("1166778899");
        professor.setEmail(dni + "@profesores.test");
        professor.setPassword("x");
        professor.setActive(true);
        return professorRepository.save(professor);
    }

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

    private GroupClass saveGroupClass(Professor professor, String name) {
        GroupClass groupClass = new GroupClass();
        groupClass.setClassName(name);
        groupClass.setProfessor(professor);
        groupClass.setDayOfWeek("MONDAY");
        groupClass.setStartTime("10:00");
        groupClass.setEndTime("11:00");
        groupClass.setCapacity(10);
        return groupClassRepository.save(groupClass);
    }

    private Map<String, Object> statusBody(Object active) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("active", active);
        return body;
    }

    // AC-0004-01: PATCH {"active": false} sobre un cliente activo responde 200, y un GET posterior
    // devuelve active: false.
    @Test
    void setStatus_deactivatingActiveClient_respondsOkAndPersists() throws Exception {
        Administrator admin = saveAdministrator("70400001");
        Client client = saveClient("60400001", true);

        mockMvc.perform(patch("/api/clients/{id}/status", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusBody(false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.succes").value(true))
                .andExpect(jsonPath("$.data.active").value(false));

        mockMvc.perform(get("/api/clients/{id}", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));
    }

    // AC-0004-02: desactivar un cliente asignado a una clase lo deja sin clase: GET
    // /api/classes/{idClase}/students ya no lo incluye.
    @Test
    void setStatus_deactivatingClientAssignedToClass_removesHimFromClassStudents() throws Exception {
        Administrator admin = saveAdministrator("70400002");
        Professor professor = saveProfessor("91400001");
        Client client = saveClient("60400002", true);
        GroupClass groupClass = saveGroupClass(professor, "Funcional");

        mockMvc.perform(post("/api/clients/{idClient}/assign-class/{idClass}", client.getId(), groupClass.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/clients/{id}/status", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusBody(false))))
                .andExpect(status().isOk());

        MvcResult result = mockMvc.perform(get("/api/classes/{id}/students", groupClass.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode students = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        boolean stillListed = false;
        for (JsonNode student : students) {
            if (student.get("id").asLong() == client.getId()) {
                stillListed = true;
            }
        }
        assertThat(stillListed).isFalse();
    }

    // AC-0004-03: PATCH {"active": true} sobre un cliente inactivo responde 200, lo deja active:true
    // y sin clase asignada.
    @Test
    void setStatus_reactivatingInactiveClient_respondsOkActiveAndWithoutClass() throws Exception {
        Administrator admin = saveAdministrator("70400003");
        Client client = saveClient("60400003", false);

        mockMvc.perform(patch("/api/clients/{id}/status", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusBody(true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(true))
                .andExpect(jsonPath("$.data.activeClassId").doesNotExist());
    }

    // AC-0004-04: PATCH {"active": false} sobre un cliente que ya está inactivo responde 200 y no
    // cambia nada (idempotente).
    @Test
    void setStatus_deactivatingAlreadyInactiveClient_respondsOkAndStaysInactive() throws Exception {
        Administrator admin = saveAdministrator("70400004");
        Client client = saveClient("60400004", false);

        mockMvc.perform(patch("/api/clients/{id}/status", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusBody(false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        mockMvc.perform(get("/api/clients/{id}", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));
    }

    // AC-0004-05: PATCH con un id inexistente responde 404 con message en español que incluye el id.
    @Test
    void setStatus_forNonExistentId_respondsNotFoundWithIdInSpanishMessage() throws Exception {
        Administrator admin = saveAdministrator("70400005");
        long nonExistentId = 9_999_999L;

        MvcResult result = mockMvc.perform(patch("/api/clients/{id}/status", nonExistentId)
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusBody(false))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.succes").value(false))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String message = json.get("message").asText();
        assertThat(message).contains(String.valueOf(nonExistentId));
    }

    // AC-0004-05: body sin "active" responde 400 en español.
    @Test
    void setStatus_withMissingActiveField_respondsBadRequest() throws Exception {
        Administrator admin = saveAdministrator("70400006");
        Client client = saveClient("60400005", true);

        mockMvc.perform(patch("/api/clients/{id}/status", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.succes").value(false));
    }

    // AC-0004-05: body con active: "si" (un string) responde 400 en español.
    @Test
    void setStatus_withActiveAsString_respondsBadRequest() throws Exception {
        Administrator admin = saveAdministrator("70400007");
        Client client = saveClient("60400006", true);

        mockMvc.perform(patch("/api/clients/{id}/status", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\": \"si\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.succes").value(false));
    }

    // AC-0004-12: autenticado como PROFESSOR, el PATCH responde 200 y desactiva al cliente.
    @Test
    void setStatus_asProfessor_respondsOkAndDeactivates() throws Exception {
        Professor professor = saveProfessor("91400002");
        Client client = saveClient("60400007", true);

        mockMvc.perform(patch("/api/clients/{id}/status", client.getId())
                        .with(user(professor.getEmail()).password("x").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusBody(false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));
    }

    // AC-0004-12: una persona autenticada que no es ADMIN ni PROFESSOR (un Client con email) recibe
    // 403 y el cliente sigue activo.
    @Test
    void setStatus_asAuthenticatedClient_respondsForbiddenAndLeavesClientActive() throws Exception {
        Client authenticatedClient = saveClient("60400008", true);
        Client targetClient = saveClient("60400009", true);

        mockMvc.perform(patch("/api/clients/{id}/status", targetClient.getId())
                        .with(user(authenticatedClient.getEmail()).password("x").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusBody(false))))
                .andExpect(status().isForbidden());

        assertThat(clientRepository.findById(targetClient.getId()).orElseThrow().isActive()).isTrue();
    }
}
