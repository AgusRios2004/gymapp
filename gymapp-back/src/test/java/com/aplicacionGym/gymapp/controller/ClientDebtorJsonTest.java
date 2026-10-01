package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.entity.MonthlyType;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.repository.AdministratorRepository;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import com.aplicacionGym.gymapp.repository.MonthlyTypeRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spec 0012: el JSON de ClientResponseDTO trae la clave {@code isDebtor} (la que lee el frontend)
 * y no {@code debtor}. Se mira el JSON crudo: leer el getter del DTO no detecta el problema.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ClientDebtorJsonTest {

    // 24/09/2026 15:00 en Argentina.
    private static final LocalDate HOY = LocalDate.of(2026, 9, 24);

    @TestConfiguration
    static class FixedClock {
        @Bean
        @Primary
        Clock fixedClock() {
            return Clock.fixed(Instant.parse("2026-09-24T18:00:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private GroupClassRepository groupClassRepository;

    @Autowired
    private MonthlyTypeRepository monthlyTypeRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private Client saveClient(String dni, String lastName) {
        Client client = new Client();
        client.setName("Bruno");
        client.setLastName(lastName);
        client.setDni(dni);
        client.setPhone("1122334455");
        client.setEmail(dni + "@clientes.test");
        client.setPassword("x");
        client.setActive(true);
        return clientRepository.save(client);
    }

    // Cuota de 30 días pagada hace 4 días: vigente hasta el 20/10.
    private Client saveClientWithCurrentFee(String dni, String lastName) {
        Client client = saveClient(dni, lastName);
        MonthlyType plan = monthlyTypeRepository.save(new MonthlyType(null, "Plan Full", 20000, 30));
        paymentRepository.save(new Payment(null, client, null, plan, 20000, HOY.minusDays(4), PaymentType.MONTHLY));
        return client;
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

    private GroupClass saveGroupClass(Professor professor) {
        GroupClass groupClass = new GroupClass();
        groupClass.setClassName("Funcional");
        groupClass.setProfessor(professor);
        groupClass.setDaysOfWeek(List.of("MONDAY"));
        groupClass.setStartTime("10:00");
        groupClass.setEndTime("11:00");
        groupClass.setCapacity(10);
        return groupClassRepository.save(groupClass);
    }

    @Test
    @DisplayName("AC-0012-01: la ficha de un alumno sin pagos trae isDebtor true y no trae debtor")
    void ac_0012_01_fichaDeAlumnoSinPagosTraeIsDebtorTrueYNoDebtor() throws Exception {
        Administrator admin = saveAdministrator("71200001");
        Client client = saveClient("61200001", "Ramirez");

        mockMvc.perform(get("/api/clients/{id}", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isDebtor").value(true))
                .andExpect(jsonPath("$.data.debtor").doesNotExist());
    }

    @Test
    @DisplayName("AC-0012-02: la ficha de un alumno con la cuota vigente trae isDebtor false")
    void ac_0012_02_fichaDeAlumnoConCuotaVigenteTraeIsDebtorFalse() throws Exception {
        Administrator admin = saveAdministrator("71200002");
        Client client = saveClientWithCurrentFee("61200002", "Alcorta");

        mockMvc.perform(get("/api/clients/{id}", client.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isDebtor").value(false))
                .andExpect(jsonPath("$.data.debtor").doesNotExist());
    }

    @Test
    @DisplayName("AC-0012-03: la lista paginada trae isDebtor en cada alumno y ninguno trae debtor")
    void ac_0012_03_listaPaginadaTraeIsDebtorYNingunoTraeDebtor() throws Exception {
        Administrator admin = saveAdministrator("71200003");
        Client client = saveClient("61200003", "Deudorlista");

        mockMvc.perform(get("/api/clients")
                        .param("search", "Deudorlista")
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(client.getId()))
                .andExpect(jsonPath("$.data.content[0].isDebtor").value(true))
                .andExpect(jsonPath("$.data.content[*]", everyItem(hasKey("isDebtor"))))
                .andExpect(jsonPath("$.data.content[*]", everyItem(not(hasKey("debtor")))));
    }

    @Test
    @DisplayName("AC-0012-04: los alumnos de una clase traen isDebtor según su cuota")
    void ac_0012_04_alumnosDeUnaClaseTraenIsDebtorSegunSuCuota() throws Exception {
        Administrator admin = saveAdministrator("71200004");
        Professor professor = saveProfessor("91200001");
        GroupClass groupClass = saveGroupClass(professor);
        Client debtor = saveClient("61200004", "Sinpago");
        Client upToDate = saveClientWithCurrentFee("61200005", "Aldia");

        for (Client client : List.of(debtor, upToDate)) {
            mockMvc.perform(post("/api/clients/{idClient}/assign-class/{idClass}", client.getId(), groupClass.getId())
                            .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(get("/api/classes/{id}/students", groupClass.getId())
                        .with(user(admin.getEmail()).password("x").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == " + debtor.getId() + ")].isDebtor").value(true))
                .andExpect(jsonPath("$.data[?(@.id == " + upToDate.getId() + ")].isDebtor").value(false))
                .andExpect(jsonPath("$.data[*]", everyItem(not(hasKey("debtor")))));
    }
}
