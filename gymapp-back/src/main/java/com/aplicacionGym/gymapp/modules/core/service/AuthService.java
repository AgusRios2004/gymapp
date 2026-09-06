package com.aplicacionGym.gymapp.modules.core.service;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.core.dto.request.LoginRequestDTO;
import com.aplicacionGym.gymapp.modules.core.dto.response.LoginResponseDTO;
import com.aplicacionGym.gymapp.modules.core.entity.Administrator;
import com.aplicacionGym.gymapp.modules.core.entity.Person;
import com.aplicacionGym.gymapp.modules.core.entity.Professor;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.core.repository.PersonRepository;
import com.aplicacionGym.gymapp.modules.core.security.JwtUtil;
import com.aplicacionGym.gymapp.modules.core.mapper.AuthMapper;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PersonRepository personRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    private final AuthMapper authMapper;

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        Person person = personRepository.findByEmail(loginRequestDTO.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + loginRequestDTO.getEmail()));

        // Check password (In real world, use passwordEncoder.matches)
        if (!loginRequestDTO.getPassword().equals(person.getPassword()) &&
                !passwordEncoder.matches(loginRequestDTO.getPassword(), person.getPassword())) {
            throw new RuntimeException("Invalid credentials!");
        }

        LoginResponseDTO response = authMapper.toLoginResponseDTO(person);

        if (person instanceof Administrator) {
            response.setRole("ADMIN");
        } else if (person instanceof Professor) {
            response.setRole("PROFESSOR");
        } else {
            response.setRole("USER");
        }

        // Generate JWT token with 15-minute expiration
        String token = jwtUtil.generateAccessToken(person.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(person.getEmail());
        response.setToken(token);
        response.setRefreshToken(refreshToken);

        return response;
    }

    public String refresh(String refreshToken) {
        if (jwtUtil.isRefreshToken(refreshToken)) {
            String email = jwtUtil.extractUsername(refreshToken);
            Person person = personRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
            return jwtUtil.generateAccessToken(person.getEmail());
        } else {
            throw new RuntimeException("Invalid refresh token!");
        }
    }
}
