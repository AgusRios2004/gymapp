package com.aplicacionGym.gymapp.security;

import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Person;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.exception.UnauthenticatedException;
import com.aplicacionGym.gymapp.repository.AdministratorRepository;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spec 0002, T1 (hallazgo del reviewer): el servicio que resuelve la persona autenticada no tenía
 * test propio, y el 401 para un token de una persona borrada era inalcanzable por HTTP.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthenticatedStaffServiceTest {

    @Autowired
    private AuthenticatedStaffService authenticatedStaffService;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MockMvc mockMvc;

    @AfterEach
    void limpiarContexto() {
        SecurityContextHolder.clearContext();
    }

    private Professor saveProfessor(String dni) {
        Professor professor = new Professor();
        professor.setName("Elena");
        professor.setLastName("Ruiz");
        professor.setDni(dni);
        professor.setPhone("1133445566");
        professor.setEmail(dni + "@profesores.test");
        professor.setPassword("x");
        professor.setActive(true);
        return professorRepository.save(professor);
    }

    private void autenticarComo(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of()));
    }

    @Test
    void sinAutenticacion_lanzaUnauthenticated() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(() -> authenticatedStaffService.getAuthenticatedPerson())
                .isInstanceOf(UnauthenticatedException.class);
    }

    @Test
    void conEmailInexistente_lanzaUnauthenticated() {
        autenticarComo("nadie@inexistente.test");

        assertThatThrownBy(() -> authenticatedStaffService.getAuthenticatedPerson())
                .isInstanceOf(UnauthenticatedException.class);
    }

    @Test
    void conProfesorYAdmin_devuelveLaPersonaYSuRol() {
        Professor professor = saveProfessor("81111222");
        Administrator admin = new Administrator();
        admin.setName("Raul");
        admin.setLastName("Diaz");
        admin.setDni("82111222");
        admin.setPhone("1133445567");
        admin.setEmail("82111222@admins.test");
        admin.setPassword("x");
        administratorRepository.save(admin);

        autenticarComo(professor.getEmail());
        Person comoProfesor = authenticatedStaffService.getAuthenticatedPerson();
        assertThat(comoProfesor.getId()).isEqualTo(professor.getId());
        assertThat(authenticatedStaffService.esProfesor(comoProfesor)).isTrue();
        assertThat(authenticatedStaffService.esAdmin(comoProfesor)).isFalse();

        autenticarComo(admin.getEmail());
        Person comoAdmin = authenticatedStaffService.getAuthenticatedPerson();
        assertThat(authenticatedStaffService.esAdmin(comoAdmin)).isTrue();
        assertThat(authenticatedStaffService.esProfesor(comoAdmin)).isFalse();
    }

    // Caso de borde de la spec 0002: "Token válido de una persona borrada después del login: 401.
    // No puede terminar en 500". Con un JWT real, no con @WithMockUser: el error nace en el filtro.
    @Test
    void tokenValidoDePersonaBorrada_respondeUnauthorizedEnEspanol() throws Exception {
        Professor professor = saveProfessor("83111222");
        String token = jwtUtil.generateToken(professor.getEmail());
        professorRepository.delete(professor);

        mockMvc.perform(post("/api/payments/product")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idClient\": 1, \"products\": []}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.succes").value(false))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
}
