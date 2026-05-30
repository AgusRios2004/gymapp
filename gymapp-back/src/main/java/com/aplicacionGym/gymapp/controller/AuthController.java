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

    @Autowired
    private com.aplicacionGym.gymapp.security.RateLimiterService rateLimiterService;

    @PostMapping("/login")
    public ResponseEntity<WebApiResponse> login(@RequestBody LoginRequestDTO loginRequestDTO, jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        if (rateLimiterService.isBlocked(ip)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS)
                    .body(WebApiResponseBuilder.failure("Too many login attempts. Please try again later."));
        }

        try {
            LoginResponseDTO loginResponseDTO = authService.login(loginRequestDTO);
            rateLimiterService.resetAttempts(ip);
            return ResponseEntity.ok(WebApiResponseBuilder.success("Login successful!", loginResponseDTO));
        } catch (Exception e) {
            rateLimiterService.registerAttempt(ip);
            throw e;
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<WebApiResponse> refresh(@RequestParam String refreshToken) {
        String newAccessToken = authService.refresh(refreshToken);
        java.util.Map<String, String> data = java.util.Map.of("token", newAccessToken);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Token refreshed successfully!", data));
    }
}
