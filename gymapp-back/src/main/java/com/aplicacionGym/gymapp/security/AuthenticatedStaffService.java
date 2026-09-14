package com.aplicacionGym.gymapp.security;

import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Person;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.exception.UnauthenticatedException;
import com.aplicacionGym.gymapp.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

// La identidad sale del contexto de seguridad que dejó el filtro JWT (username = email de la
// Person), igual que CustomUserDetailsService. No se lee el token a mano acá.
@Service
public class AuthenticatedStaffService {

    @Autowired
    private PersonRepository personRepository;

    public Person getAuthenticatedPerson() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthenticatedException("No hay una sesión autenticada.");
        }
        return personRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UnauthenticatedException("La persona autenticada no existe."));
    }

    public boolean esAdmin(Person person) {
        return person instanceof Administrator;
    }

    public boolean esProfesor(Person person) {
        return person instanceof Professor;
    }
}
