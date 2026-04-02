package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.request.LoginRequestDTO;
import com.aplicacionGym.gymapp.dto.response.LoginResponseDTO;
import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<WebApiResponse> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        LoginResponseDTO loginResponseDTO = authService.login(loginRequestDTO);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Login successful!", loginResponseDTO));
    }
}
