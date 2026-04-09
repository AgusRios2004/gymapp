package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.request.LoginRequestDTO;
import com.aplicacionGym.gymapp.dto.response.LoginResponseDTO;
import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Person;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.PersonRepository;
import com.aplicacionGym.gymapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        Person person = personRepository.findByEmail(loginRequestDTO.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + loginRequestDTO.getEmail()));

        // Check password (In real world, use passwordEncoder.matches)
        if (!loginRequestDTO.getPassword().equals(person.getPassword()) &&
                !passwordEncoder.matches(loginRequestDTO.getPassword(), person.getPassword())) {
            throw new RuntimeException("Invalid credentials!");
        }

        LoginResponseDTO response = new LoginResponseDTO();
        response.setId(person.getId());
        response.setName(person.getName());
        response.setLastName(person.getLastName());
        response.setEmail(person.getEmail());

        if (person instanceof Administrator) {
            response.setRole("ADMIN");
        } else if (person instanceof Professor) {
            response.setRole("PROFESSOR");
        } else {
            response.setRole("USER");
        }

        // Generate JWT token with 30-day expiration
        String token = jwtUtil.generateToken(person.getEmail());
        response.setToken(token);

        return response;
    }
}
