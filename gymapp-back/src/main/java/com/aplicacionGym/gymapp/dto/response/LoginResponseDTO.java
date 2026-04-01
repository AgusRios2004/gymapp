package com.aplicacionGym.gymapp.dto.response;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private Long id;
    private String name;
    private String lastName;
    private String email;
    private String role; // "ADMIN" or "PROFESSOR"
}
